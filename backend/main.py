import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.config import GEMINI_API_KEY, GEMINI_MODEL, ENVIRONMENT
from backend.database import init_db, get_db, hash_password, verify_password
from backend.security import (
    create_access_token,
    get_current_user,
    get_current_user_optional,
    get_current_admin,
    get_current_expert_or_admin,
    sanitize_user
)
from backend.models import (
    RegisterRequest, LoginRequest, TokenResponse, UserProfileUpdate,
    FarmCropCreate, CropDiagnosisRequest, CropDiagnosisResponse,
    ChatQueryRequest, WeatherQueryRequest, MandiQueryRequest,
    SchemeFilterRequest, ExpertConsultationCreate, ExpertAnswerRequest,
    CropLossReportCreate, SprayDecisionRequest, SprayDecisionResponse,
    ProfitCalculatorRequest, ProfitCalculatorResponse,
    CommunityPostCreate, CommunityReplyCreate
)
from backend.services.ai_service import analyze_crop_image, generate_chat_response
from backend.services.weather_service import get_weather_forecast, DISTRICT_COORDINATES
from backend.services.mandi_service import get_mandi_prices
from backend.services.scheme_service import search_schemes
from backend.services.tools_service import evaluate_spray_decision, calculate_farmer_profit, generate_report_code

# Initialize FastAPI App
app = FastAPI(
    title="Kisan Setu API",
    description="Unified Digital Agricultural Assistance Platform for Indian Farmers",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("[Kisan Setu] Database initialized.")
    except Exception as e:
        print(f"[Kisan Setu] Startup DB initialization notice: {e}")

# ============================================================================
# 1. Health & Meta Endpoints
# ============================================================================

@app.get("/api")
@app.get("/api/")
def api_root():
    return {
        "status": "healthy",
        "service": "Kisan Setu Agricultural Engine",
        "version": "1.0.0",
        "gemini_configured": bool(GEMINI_API_KEY)
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Kisan Setu Agricultural Engine",
        "version": "1.0.0",
        "gemini_configured": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL,
        "environment": ENVIRONMENT
    }

@app.get("/api/districts")
def get_districts():
    """Returns available Karnataka and Indian districts with pre-mapped coordinates."""
    districts = [
        {"id": k, "name": v["name"], "lat": v["lat"], "lon": v["lon"]}
        for k, v in DISTRICT_COORDINATES.items()
    ]
    return {"districts": sorted(districts, key=lambda x: x["name"])}

# ============================================================================
# 2. Authentication & User Profile
# ============================================================================

@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE phone = ?", (req.phone.strip(),))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A farmer or expert account with this mobile number is already registered."
            )
        
        pwd_hash, salt = hash_password(req.password)
        cursor.execute("""
        INSERT INTO users (
            phone, name, password_hash, salt, role, language,
            state, district, taluk, village, land_acres, soil_type, irrigation_type,
            expert_title, expert_specialization, is_verified_expert
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req.phone.strip(),
            req.name.strip(),
            pwd_hash,
            salt,
            req.role or "farmer",
            req.language or "kn",
            req.state or "Karnataka",
            req.district or "Mandya",
            req.taluk or "",
            req.village or "",
            req.land_acres or 0.0,
            req.soil_type or "Red Sandy Loam",
            req.irrigation_type or "Borewell",
            req.expert_title or "",
            req.expert_specialization or "",
            1 if req.role == "expert" and False else 0 # New experts require admin verification
        ))
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        safe_user = sanitize_user(dict(user_row))

    token = create_access_token({"sub": safe_user["id"], "role": safe_user["role"]})
    return {"token": token, "user": safe_user}

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE phone = ?", (req.phone.strip(),))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid mobile number or password."
            )
        
        user_dict = dict(row)
        if not verify_password(req.password, user_dict["salt"], user_dict["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid mobile number or password."
            )
        
        safe_user = sanitize_user(user_dict)

    token = create_access_token({"sub": safe_user["id"], "role": safe_user["role"]})
    return {"token": token, "user": safe_user}

@app.get("/api/auth/me")
def get_current_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM farm_crops WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        crops = [dict(r) for r in cursor.fetchall()]
    
    current_user["crops"] = crops
    return {"user": current_user}

@app.put("/api/auth/profile")
def update_profile(req: UserProfileUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    fields = []
    params = []
    for k, v in req.model_dump(exclude_unset=True).items():
        if v is not None:
            fields.append(f"{k} = ?")
            params.append(v)
            
    if not fields:
        return {"status": "no change", "user": current_user}

    params.append(current_user["id"])
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", tuple(params))
        cursor.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],))
        updated_row = cursor.fetchone()

    return {"status": "updated", "user": sanitize_user(dict(updated_row))}

# ============================================================================
# 3. Module A — AI Crop Intelligence
# ============================================================================

@app.post("/api/crop-diagnosis", response_model=CropDiagnosisResponse)
def diagnose_crop(
    req: CropDiagnosisRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Crop leaf photograph is required for diagnosis.")

    diagnosis = analyze_crop_image(
        image_base64=req.image_base64,
        crop_name_hint=req.crop_name,
        language=req.language or "kn"
    )

    diag_id = None
    if current_user:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO crop_diagnoses (
                user_id, crop_name, condition_name, condition_type,
                confidence_score, visible_symptoms, possible_causes,
                recommended_actions, what_to_avoid, source_info
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                current_user["id"],
                diagnosis.get("crop_name", req.crop_name or "Crop"),
                diagnosis.get("condition_name", "Leaf Condition"),
                diagnosis.get("condition_type", "Disease"),
                diagnosis.get("confidence_score", 85),
                diagnosis.get("visible_symptoms", ""),
                diagnosis.get("possible_causes", ""),
                diagnosis.get("recommended_actions", ""),
                diagnosis.get("what_to_avoid", ""),
                diagnosis.get("source_info", "ICAR Extension")
            ))
            diag_id = cursor.lastrowid

    return CropDiagnosisResponse(
        id=diag_id,
        crop_name=diagnosis.get("crop_name", req.crop_name or "Crop"),
        condition_name=diagnosis.get("condition_name", "Unknown Issue"),
        condition_type=diagnosis.get("condition_type", "Disease"),
        confidence_score=diagnosis.get("confidence_score", 80),
        visible_symptoms=diagnosis.get("visible_symptoms", ""),
        possible_causes=diagnosis.get("possible_causes", ""),
        recommended_actions=diagnosis.get("recommended_actions", ""),
        what_to_avoid=diagnosis.get("what_to_avoid", ""),
        source_info=diagnosis.get("source_info", "ICAR-KVK Packages of Practices"),
        expert_verification_status=diagnosis.get("expert_verification_status", "AI Assessment"),
        disclaimer=diagnosis.get("disclaimer", "")
    )

@app.get("/api/crop-diagnosis/history")
def get_diagnosis_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM crop_diagnoses WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        rows = [dict(r) for r in cursor.fetchall()]
    return {"history": rows}

# ============================================================================
# 4. Module B — Kisan AI Assistant
# ============================================================================

@app.post("/api/chat")
def chat_with_assistant(
    req: ChatQueryRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user_id = current_user["id"] if current_user else None
    conv_id = req.conversation_id
    history = []

    with get_db() as conn:
        cursor = conn.cursor()
        if conv_id:
            cursor.execute("SELECT sender, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC", (conv_id,))
            history = [dict(r) for r in cursor.fetchall()]
        else:
            # Create a new conversation
            cursor.execute("""
            INSERT INTO chat_conversations (user_id, session_id, title, language)
            VALUES (?, ?, ?, ?)
            """, (user_id, "session_" + os.urandom(8).hex(), req.message[:35] + "...", req.language or "kn"))
            conv_id = cursor.lastrowid

        # Insert user message
        cursor.execute("""
        INSERT INTO chat_messages (conversation_id, sender, content)
        VALUES (?, 'user', ?)
        """, (conv_id, req.message))

    # Incorporate farmer profile context if available
    farm_context = req.farm_context or {}
    if current_user and not farm_context:
        farm_context = {
            "district": current_user.get("district"),
            "soil_type": current_user.get("soil_type"),
            "land_acres": current_user.get("land_acres"),
            "irrigation_type": current_user.get("irrigation_type")
        }

    # Generate grounded response
    ai_reply = generate_chat_response(
        message=req.message,
        conversation_history=history,
        language=req.language or "kn",
        farm_context=farm_context,
        image_base64=req.image_base64
    )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO chat_messages (conversation_id, sender, content, sources)
        VALUES (?, 'assistant', ?, ?)
        """, (conv_id, ai_reply["content"], ai_reply.get("sources", "")))

    return {
        "conversation_id": conv_id,
        "response": ai_reply["content"],
        "sources": ai_reply.get("sources"),
        "language": req.language or "kn"
    }

@app.get("/api/chat/history")
def get_chat_conversations(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT c.*, 
            (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
        FROM chat_conversations c
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
        """, (current_user["id"],))
        convs = [dict(r) for r in cursor.fetchall()]
    return {"conversations": convs}

@app.get("/api/chat/messages/{conversation_id}")
def get_chat_messages(conversation_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
        messages = [dict(r) for r in cursor.fetchall()]
    return {"messages": messages}

# ============================================================================
# 5. Module C — Smart Weather Intelligence
# ============================================================================

@app.post("/api/weather")
def get_weather(req: WeatherQueryRequest):
    weather = get_weather_forecast(
        latitude=req.latitude,
        longitude=req.longitude,
        district_name=req.district,
        language=req.language or "kn"
    )
    return weather

# ============================================================================
# 6. Module D — Smart Mandi & Market Intelligence
# ============================================================================

@app.post("/api/mandi")
def get_mandi(req: MandiQueryRequest):
    return get_mandi_prices(
        commodity=req.commodity or "All",
        district=req.district or "All",
        state=req.state or "Karnataka"
    )

# ============================================================================
# 7. Module E — Government Scheme Finder
# ============================================================================

@app.post("/api/schemes")
def get_schemes(req: SchemeFilterRequest):
    return search_schemes(
        state=req.state or "Karnataka",
        land_acres=req.land_acres or 2.0,
        crop_type=req.crop_type or "Any",
        farmer_category=req.farmer_category or "Small / Marginal",
        annual_income=req.annual_income or 150000.0
    )

# ============================================================================
# 8. Module F — Farmer Expert Connect
# ============================================================================

@app.get("/api/experts")
def list_experts():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, name, phone, district, taluk, expert_title, expert_specialization, is_verified_expert
        FROM users 
        WHERE role IN ('expert', 'admin')
        ORDER BY is_verified_expert DESC, name ASC
        """)
        experts = [dict(r) for r in cursor.fetchall()]
    return {"experts": experts}

@app.post("/api/experts/consult")
def submit_consultation(
    req: ExpertConsultationCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO expert_consultations (
            farmer_id, farmer_name, farmer_phone, expert_id,
            crop_name, district, query_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            current_user["name"],
            current_user["phone"],
            req.expert_id,
            req.crop_name,
            req.district,
            req.query_text
        ))
        consult_id = cursor.lastrowid

    return {
        "status": "submitted",
        "consultation_id": consult_id,
        "message": "Your query has been submitted to verified agricultural officers. You will receive advice directly here."
    }

@app.get("/api/experts/consultations")
def get_user_consultations(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        if current_user["role"] in ("expert", "admin"):
            cursor.execute("SELECT * FROM expert_consultations ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT * FROM expert_consultations WHERE farmer_id = ? ORDER BY created_at DESC", (current_user["id"],))
        consultations = [dict(r) for r in cursor.fetchall()]
    return {"consultations": consultations}

@app.post("/api/experts/consultations/{consultation_id}/answer")
def answer_consultation(
    consultation_id: int,
    req: ExpertAnswerRequest,
    current_expert: Dict[str, Any] = Depends(get_current_expert_or_admin)
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE expert_consultations 
        SET status = 'answered',
            expert_response = ?,
            expert_name = ?,
            answered_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """, (req.expert_response, current_expert["name"], consultation_id))
    return {"status": "success", "message": "Expert response published successfully."}

# ============================================================================
# 9. Differentiator Features
# ============================================================================

# Feature 1 — Crop Health History (Digital Field Diary)
@app.get("/api/farm-crops")
def list_farm_crops(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM farm_crops WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        crops = [dict(r) for r in cursor.fetchall()]
    return {"crops": crops}

@app.post("/api/farm-crops")
def add_farm_crop(req: FarmCropCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO farm_crops (user_id, crop_name, variety, sowing_date, acreage, growth_stage, soil_health_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            req.crop_name,
            req.variety,
            req.sowing_date,
            req.acreage,
            req.growth_stage,
            req.soil_health_notes
        ))
        crop_id = cursor.lastrowid
        cursor.execute("SELECT * FROM farm_crops WHERE id = ?", (crop_id,))
        new_crop = dict(cursor.fetchone())
    return {"status": "created", "crop": new_crop}

@app.delete("/api/farm-crops/{crop_id}")
def delete_farm_crop(crop_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM farm_crops WHERE id = ? AND user_id = ?", (crop_id, current_user["id"]))
    return {"status": "deleted"}

# Feature 3 — Before You Spray
@app.post("/api/tools/spray-decision", response_model=SprayDecisionResponse)
def spray_decision(req: SprayDecisionRequest):
    return evaluate_spray_decision(req)

# Feature 4 — Crop Loss Documentation & Report Generator
@app.post("/api/tools/crop-loss-report")
def create_crop_loss_report(
    req: CropLossReportCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    report_code = generate_report_code(req.location_district)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO crop_loss_reports (
            user_id, farmer_name, farmer_phone, report_code, crop_name, variety,
            affected_acres, total_acres, damage_cause, damage_date,
            location_district, location_taluk, location_village, estimated_loss_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            current_user["name"],
            current_user["phone"],
            report_code,
            req.crop_name,
            req.variety or "",
            req.affected_acres,
            req.total_acres,
            req.damage_cause,
            req.damage_date,
            req.location_district,
            req.location_taluk,
            req.location_village,
            req.estimated_loss_amount or 0.0
        ))
        report_id = cursor.lastrowid

    return {
        "status": "created",
        "report_id": report_id,
        "report_code": report_code,
        "message": f"Crop loss incident recorded with official reference code: {report_code}"
    }

@app.get("/api/tools/crop-loss-reports")
def get_user_loss_reports(current_user: Dict[str, Any] = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM crop_loss_reports WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        reports = [dict(r) for r in cursor.fetchall()]
    return {"reports": reports}

# Feature 5 — Farmer Profit Calculator
@app.post("/api/tools/profit-calculator", response_model=ProfitCalculatorResponse)
def calculate_profit(req: ProfitCalculatorRequest):
    return calculate_farmer_profit(req)

# Feature 6 — Community Knowledge Network
@app.get("/api/community/posts")
def list_community_posts(crop: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM community_posts WHERE status = 'active'"
        params = []
        if crop and crop != "All":
            query += " AND crop_tag = ?"
            params.append(crop)
        query += " ORDER BY created_at DESC"
        cursor.execute(query, tuple(params))
        posts = [dict(r) for r in cursor.fetchall()]

        # Attach replies for each post
        for post in posts:
            cursor.execute("SELECT * FROM community_replies WHERE post_id = ? ORDER BY created_at ASC", (post["id"],))
            post["replies"] = [dict(r) for r in cursor.fetchall()]

    return {"posts": posts}

@app.post("/api/community/posts")
def create_community_post(
    req: CommunityPostCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO community_posts (user_id, author_name, author_role, crop_tag, title, body)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            current_user["id"],
            current_user["name"],
            current_user["role"],
            req.crop_tag,
            req.title,
            req.body
        ))
        post_id = cursor.lastrowid

    return {"status": "created", "post_id": post_id}

@app.post("/api/community/posts/{post_id}/upvote")
def upvote_community_post(post_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
    return {"status": "upvoted"}

@app.post("/api/community/posts/{post_id}/reply")
def reply_community_post(
    post_id: int,
    req: CommunityReplyCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    is_expert = 1 if current_user.get("role") in ("expert", "admin") else 0
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO community_replies (post_id, user_id, author_name, author_role, body, is_expert_answer)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            post_id,
            current_user["id"],
            current_user["name"],
            current_user["role"],
            req.body,
            is_expert
        ))
        reply_id = cursor.lastrowid
    return {"status": "created", "reply_id": reply_id}

# ============================================================================
# 10. Admin Dashboard (Section 7)
# ============================================================================

@app.get("/api/admin/overview")
def get_admin_overview(admin: Dict[str, Any] = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'farmer'")
        total_farmers = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'expert'")
        total_experts = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM crop_diagnoses")
        total_diagnoses = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM expert_consultations WHERE status = 'submitted'")
        pending_queries = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM crop_loss_reports")
        total_loss_reports = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM community_posts")
        total_posts = cursor.fetchone()[0]

    return {
        "total_farmers": total_farmers,
        "total_experts": total_experts,
        "total_diagnoses": total_diagnoses,
        "pending_expert_queries": pending_queries,
        "total_loss_reports": total_loss_reports,
        "total_community_posts": total_posts
    }

@app.get("/api/admin/users")
def get_admin_users(admin: Dict[str, Any] = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, phone, name, role, language, district, taluk, village, land_acres, is_verified_expert, created_at FROM users ORDER BY created_at DESC")
        users = [dict(r) for r in cursor.fetchall()]
    return {"users": users}

@app.post("/api/admin/verify-expert/{expert_id}")
def verify_expert(expert_id: int, admin: Dict[str, Any] = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_verified_expert = 1 WHERE id = ? AND role = 'expert'", (expert_id,))
    return {"status": "verified"}

# ============================================================================
# 11. Static Files & Frontend SPA Serving
# ============================================================================

ROOT_DIST = Path(__file__).resolve().parent.parent / "dist"
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
STATIC_DIR = ROOT_DIST if ROOT_DIST.exists() else FRONTEND_DIST

if STATIC_DIR.exists():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
