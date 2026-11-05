"""
Kisan Setu Comprehensive Automated Test Suite
Validates all platform modules, authentication, AI agronomic grounding,
real-time weather, mandi pricing, scheme eligibility, and specialized tools.
"""

import sys
import json
import base64
from fastapi.testclient import TestClient

# Ensure UTF-8 output encoding on Windows
sys.stdout.reconfigure(encoding='utf-8')

from backend.main import app
from backend.database import init_db

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("🌾 KISAN SETU — COMPREHENSIVE INTEGRATION & FUNCTIONAL TEST SUITE 🌾")
    print("=" * 70)

    # 1. Initialize Database
    print("\n[1/14] Initializing Database & Seed Records...")
    init_db()
    print("  ✓ Database tables & seed accounts verified.")

    # 2. Health & Meta
    print("\n[2/14] Testing Health & Meta Endpoints...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    print(f"  ✓ Health Status: {health_data['status']} | Gemini Configured: {health_data['gemini_configured']} | Model: {health_data['model']}")

    res_dist = client.get("/api/districts")
    assert res_dist.status_code == 200
    districts = res_dist.json()["districts"]
    assert len(districts) >= 20
    print(f"  ✓ District Registry: {len(districts)} districts pre-mapped.")

    # 3. Authentication & RBAC
    print("\n[3/14] Testing Authentication & RBAC Flow...")
    # Test Farmer Login
    res_login = client.post("/api/auth/login", json={"phone": "9845012345", "password": "Farmer@123"})
    assert res_login.status_code == 200, f"Farmer login failed: {res_login.text}"
    farmer_token = res_login.json()["token"]
    farmer_user = res_login.json()["user"]
    assert farmer_user["role"] == "farmer"
    print(f"  ✓ Farmer Login OK: {farmer_user['name']} ({farmer_user['district']})")

    # Test Admin Login
    res_admin = client.post("/api/auth/login", json={"phone": "9999900000", "password": "Admin@KisanSetu2026"})
    assert res_admin.status_code == 200
    admin_token = res_admin.json()["token"]
    print("  ✓ Admin Login OK.")

    # Test Invalid Password
    res_bad = client.post("/api/auth/login", json={"phone": "9845012345", "password": "WrongPassword"})
    assert res_bad.status_code == 401
    print("  ✓ Rejected invalid password with 401.")

    # 4. Profile Management & Field Diary
    print("\n[4/14] Testing Profile & Digital Field Diary...")
    headers_farmer = {"Authorization": f"Bearer {farmer_token}"}
    res_me = client.get("/api/auth/me", headers=headers_farmer)
    assert res_me.status_code == 200
    crops = res_me.json()["user"]["crops"]
    assert len(crops) >= 2
    print(f"  ✓ Field Diary: {len(crops)} active crops tracked for farmer.")

    # Add new crop to diary
    res_add_crop = client.post("/api/farm-crops", headers=headers_farmer, json={
        "crop_name": "Cotton (ಹತ್ತಿ)",
        "variety": "Bt Cotton Hybrid",
        "sowing_date": "2026-07-10",
        "acreage": 1.5,
        "growth_stage": "Boll Development",
        "soil_health_notes": "Bio-fertilizers applied"
    })
    assert res_add_crop.status_code == 200
    new_crop_id = res_add_crop.json()["crop"]["id"]
    print(f"  ✓ Added crop to Field Diary (ID: {new_crop_id}).")

    # 5. AI Crop Intelligence (Module A)
    print("\n[5/14] Testing AI Crop Intelligence (Module A)...")
    # 1x1 dummy pixel base64 for testing input pipeline
    dummy_b64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    res_diag = client.post("/api/crop-diagnosis", headers=headers_farmer, json={
        "image_base64": dummy_b64,
        "crop_name": "Tomato",
        "language": "kn"
    })
    assert res_diag.status_code == 200, f"Diagnosis failed: {res_diag.text}"
    diag_data = res_diag.json()
    assert "condition_name" in diag_data
    assert "visible_symptoms" in diag_data
    assert "recommended_actions" in diag_data
    assert "what_to_avoid" in diag_data
    assert "source_info" in diag_data
    assert "disclaimer" in diag_data
    print(f"  ✓ AI Diagnosis: Condition='{diag_data['condition_name']}', Confidence={diag_data['confidence_score']}%, Source='{diag_data['source_info']}'")

    # 6. Kisan AI Assistant (Module B)
    print("\n[6/14] Testing Kisan AI Assistant (Module B)...")
    res_chat = client.post("/api/chat", headers=headers_farmer, json={
        "message": "ನನ್ನ ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?",
        "language": "kn"
    })
    assert res_chat.status_code == 200, f"Chat failed: {res_chat.text}"
    chat_data = res_chat.json()
    assert len(chat_data["response"]) > 15
    print(f"  ✓ Conversational Assistant responded in Kannada: '{chat_data['response'][:65]}...'")

    # 7. Real-Time Weather Intelligence (Module C)
    print("\n[7/14] Testing Real-Time Weather Intelligence (Module C)...")
    res_wx = client.post("/api/weather", json={"district": "mandya", "language": "kn"})
    assert res_wx.status_code == 200, f"Weather failed: {res_wx.text}"
    wx_data = res_wx.json()
    assert "current" in wx_data
    assert "hourly_24h" in wx_data
    assert len(wx_data["daily_7d"]) >= 5
    assert len(wx_data["agro_recommendations"]) >= 1
    print(f"  ✓ Live Weather: {wx_data['location']} | Temp: {wx_data['current']['temperature_c']}°C | Humidity: {wx_data['current']['humidity_pct']}% | Advisories: {len(wx_data['agro_recommendations'])}")

    # 8. Mandi & Market Intelligence (Module D)
    print("\n[8/14] Testing Mandi & Market Intelligence (Module D)...")
    res_mandi = client.post("/api/mandi", json={"commodity": "All", "district": "All"})
    assert res_mandi.status_code == 200, f"Mandi failed: {res_mandi.text}"
    mandi_data = res_mandi.json()
    assert mandi_data["total_count"] >= 10
    assert len(mandi_data["available_commodities"]) >= 5
    # Verify estimated freight and net return calculation
    first_record = mandi_data["records"][0]
    assert "estimated_net_return_per_qtl" in first_record
    assert first_record["modal_price"] >= first_record["estimated_net_return_per_qtl"]
    print(f"  ✓ Mandi Intelligence: {mandi_data['total_count']} live APMC price records | Freight & Net Return verified.")

    # 9. Government Scheme Finder (Module E)
    print("\n[9/14] Testing Government Scheme Finder (Module E)...")
    res_schemes = client.post("/api/schemes", json={
        "state": "Karnataka",
        "land_acres": 2.5,
        "crop_type": "Millets",
        "farmer_category": "Small / Marginal"
    })
    assert res_schemes.status_code == 200, f"Schemes failed: {res_schemes.text}"
    sch_data = res_schemes.json()
    assert sch_data["total_count"] >= 6
    assert sch_data["eligible_count"] >= 3
    # Verify official portal links and required documents
    for s in sch_data["schemes"]:
        assert s["official_portal_url"].startswith("http")
        assert len(s["required_documents"]) >= 2
    print(f"  ✓ Schemes Finder: {sch_data['total_count']} registered schemes | {sch_data['eligible_count']} eligible for 2.5-acre farmer.")

    # 10. Farmer Expert Connect (Module F)
    print("\n[10/14] Testing Farmer Expert Connect (Module F)...")
    res_exp = client.get("/api/experts")
    assert res_exp.status_code == 200
    experts = res_exp.json()["experts"]
    assert len(experts) >= 3
    verified_count = sum(1 for e in experts if e["is_verified_expert"] == 1)
    print(f"  ✓ Expert Directory: {len(experts)} agricultural scientists ({verified_count} verified).")

    # Farmer submits consultation query
    res_consult = client.post("/api/experts/consult", headers=headers_farmer, json={
        "expert_id": experts[0]["id"],
        "crop_name": "Tomato",
        "district": "Mandya",
        "query_text": "Need clarification on organic control of leaf miners."
    })
    assert res_consult.status_code == 200
    consult_id = res_consult.json()["consultation_id"]
    print(f"  ✓ Consultation query submitted (ID: {consult_id}).")

    # Expert answers query
    expert_headers = {"Authorization": f"Bearer {admin_token}"}
    res_answer = client.post(f"/api/experts/consultations/{consult_id}/answer", headers=expert_headers, json={
        "expert_response": "Install yellow sticky traps (15/acre) and spray 5% Neem Seed Kernel Extract (NSKE)."
    })
    assert res_answer.status_code == 200
    print("  ✓ Expert answered consultation successfully.")

    # 11. Spray Decision Assistant (Feature 3)
    print("\n[11/14] Testing Before You Spray Assistant (Feature 3)...")
    # Safe conditions test
    res_spray_safe = client.post("/api/tools/spray-decision", json={
        "crop_name": "Tomato",
        "target_pest_or_disease": "Leaf Curl",
        "chemical_or_formulation": "Neem Oil 10000 ppm",
        "temperature_c": 27.0,
        "rain_probability_pct": 5.0,
        "wind_speed_kmh": 7.0
    })
    assert res_spray_safe.status_code == 200
    assert res_spray_safe.json()["recommendation"] == "GO"

    # Unsafe rain conditions test
    res_spray_rain = client.post("/api/tools/spray-decision", json={
        "crop_name": "Tomato",
        "target_pest_or_disease": "Leaf Curl",
        "chemical_or_formulation": "Neem Oil",
        "temperature_c": 27.0,
        "rain_probability_pct": 75.0,
        "wind_speed_kmh": 6.0
    })
    assert res_spray_rain.json()["recommendation"] == "DO_NOT_SPRAY"
    print("  ✓ Spray Assistant correctly evaluates GO vs DO_NOT_SPRAY thresholds.")

    # 12. Crop Loss Documentation (Feature 4)
    print("\n[12/14] Testing Crop Loss Documentation (Feature 4)...")
    res_loss = client.post("/api/tools/crop-loss-report", headers=headers_farmer, json={
        "crop_name": "Paddy",
        "variety": "Sona Masoori",
        "affected_acres": 2.0,
        "total_acres": 3.5,
        "damage_cause": "Hailstorm / Heavy Unseasonal Rain",
        "damage_date": "2026-10-25",
        "location_district": "Mandya",
        "location_taluk": "Pandavapura",
        "location_village": "Melukote",
        "estimated_loss_amount": 65000.0
    })
    assert res_loss.status_code == 200
    report_code = res_loss.json()["report_code"]
    assert report_code.startswith("KS-LOSS-")
    print(f"  ✓ Incident report generated with code: {report_code}")

    # 13. Farmer Profit Calculator (Feature 5)
    print("\n[13/14] Testing Farmer Profit & Break-Even Calculator (Feature 5)...")
    res_calc = client.post("/api/tools/profit-calculator", json={
        "crop_name": "Ragi",
        "land_acres": 2.0,
        "seed_cost": 1500,
        "fertilizer_and_manure_cost": 6000,
        "pesticide_and_bio_cost": 2000,
        "labour_cost": 12000,
        "irrigation_and_machinery_cost": 3000,
        "transport_and_marketing_cost": 2000,
        "expected_harvest_quantity_quintals": 20,
        "selling_price_per_quintal": 3350
    })
    assert res_calc.status_code == 200
    calc = res_calc.json()
    assert calc["total_investment"] == 26500.0
    assert calc["gross_revenue"] == 67000.0
    assert calc["net_profit_or_loss"] == 40500.0
    assert calc["break_even_price"] == 1325.0
    assert calc["is_profitable"] is True
    print(f"  ✓ Profit Calculator: Investment=₹{calc['total_investment']:,} | Revenue=₹{calc['gross_revenue']:,} | Net=₹{calc['net_profit_or_loss']:,} | Break-Even=₹{calc['break_even_price']}/qtl")

    # 14. Community Forum & Admin Overview
    print("\n[14/14] Testing Community Forum & Admin Overview...")
    res_posts = client.get("/api/community/posts")
    assert res_posts.status_code == 200
    assert len(res_posts.json()["posts"]) >= 1

    # Admin Overview
    res_admin_ov = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_ov.status_code == 200
    ov = res_admin_ov.json()
    assert ov["total_farmers"] >= 1
    assert ov["total_experts"] >= 3
    print(f"  ✓ Admin Overview: Farmers={ov['total_farmers']}, Experts={ov['total_experts']}, Diagnoses={ov['total_diagnoses']}, Loss Reports={ov['total_loss_reports']}")

    print("\n" + "=" * 70)
    print("🎉 ALL 14 TEST MODULES PASSED SUCCESSFULLY WITH ZERO ERRORS! 🎉")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
