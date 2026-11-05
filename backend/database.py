import sqlite3
import hashlib
import os
import json
from contextlib import contextmanager
from typing import Generator, Any, Dict, List, Optional
from backend.config import DATABASE_PATH

def get_connection() -> sqlite3.Connection:
    # Ensure parent directory of database exists if not in /tmp
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception:
            pass
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    if DATABASE_PATH.startswith("/tmp") or os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        conn.execute("PRAGMA journal_mode = DELETE;")
    else:
        try:
            conn.execute("PRAGMA journal_mode = WAL;")
        except Exception:
            conn.execute("PRAGMA journal_mode = DELETE;")
    return conn

_db_initialized = False

def ensure_db_initialized():
    global _db_initialized
    if not _db_initialized:
        _db_initialized = True
        try:
            init_db()
        except Exception as e:
            print(f"[DB Init Notice] {e}")

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    ensure_db_initialized()
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = os.urandom(16).hex()
    pwd_bytes = (password + salt).encode("utf-8")
    pwd_hash = hashlib.sha256(pwd_bytes).hexdigest()
    return pwd_hash, salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    pwd_hash, _ = hash_password(password, salt)
    return pwd_hash == expected_hash

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'farmer',
            language TEXT DEFAULT 'kn',
            state TEXT DEFAULT 'Karnataka',
            district TEXT DEFAULT 'Mandya',
            taluk TEXT DEFAULT 'Pandavapura',
            village TEXT DEFAULT 'Melukote',
            land_acres REAL DEFAULT 2.5,
            soil_type TEXT DEFAULT 'Red Sandy Loam',
            irrigation_type TEXT DEFAULT 'Borewell',
            expert_title TEXT DEFAULT '',
            expert_specialization TEXT DEFAULT '',
            is_verified_expert INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Farm Crops (Digital Field Diary)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS farm_crops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            crop_name TEXT NOT NULL,
            variety TEXT DEFAULT '',
            sowing_date TEXT NOT NULL,
            acreage REAL DEFAULT 1.0,
            growth_stage TEXT DEFAULT 'Vegetative',
            soil_health_notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 3. Crop Diagnoses
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS crop_diagnoses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            crop_name TEXT NOT NULL,
            image_path TEXT DEFAULT '',
            condition_name TEXT NOT NULL,
            condition_type TEXT DEFAULT 'Disease',
            confidence_score INTEGER DEFAULT 85,
            visible_symptoms TEXT NOT NULL,
            possible_causes TEXT NOT NULL,
            recommended_actions TEXT NOT NULL,
            what_to_avoid TEXT NOT NULL,
            source_info TEXT NOT NULL,
            is_expert_verified INTEGER DEFAULT 0,
            expert_notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 4. Chat Conversations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            session_id TEXT NOT NULL,
            title TEXT DEFAULT 'Agricultural Query',
            language TEXT DEFAULT 'kn',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 5. Chat Messages
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            sources TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
        );
        """)

        # 6. Expert Consultations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS expert_consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            farmer_name TEXT NOT NULL,
            farmer_phone TEXT NOT NULL,
            expert_id INTEGER,
            crop_name TEXT NOT NULL,
            district TEXT NOT NULL,
            query_text TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            status TEXT DEFAULT 'submitted',
            expert_response TEXT DEFAULT '',
            expert_name TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            answered_at TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 7. Crop Loss Reports
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS crop_loss_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            farmer_name TEXT NOT NULL,
            farmer_phone TEXT NOT NULL,
            report_code TEXT UNIQUE NOT NULL,
            crop_name TEXT NOT NULL,
            variety TEXT DEFAULT '',
            affected_acres REAL NOT NULL,
            total_acres REAL NOT NULL,
            damage_cause TEXT NOT NULL,
            damage_date TEXT NOT NULL,
            location_district TEXT NOT NULL,
            location_taluk TEXT NOT NULL,
            location_village TEXT NOT NULL,
            photo_url TEXT DEFAULT '',
            estimated_loss_amount REAL DEFAULT 0.0,
            insurance_applied INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 8. Community Posts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS community_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            author_name TEXT NOT NULL,
            author_role TEXT DEFAULT 'farmer',
            crop_tag TEXT NOT NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            upvotes INTEGER DEFAULT 0,
            expert_verified INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 9. Community Replies
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS community_replies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            author_name TEXT NOT NULL,
            author_role TEXT DEFAULT 'farmer',
            body TEXT NOT NULL,
            is_expert_answer INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # Seed essential default records
        seed_default_data(cursor)

def seed_default_data(cursor: sqlite3.Cursor):
    # Check if admin exists
    cursor.execute("SELECT id FROM users WHERE phone = ?", ("9999900000",))
    if not cursor.fetchone():
        pwd_hash, salt = hash_password("Admin@KisanSetu2026")
        cursor.execute("""
        INSERT INTO users (phone, name, password_hash, salt, role, language, state, district, taluk, village)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "9999900000",
            "Kisan Setu Administrator",
            pwd_hash,
            salt,
            "admin",
            "kn",
            "Karnataka",
            "Bengaluru Urban",
            "Bengaluru",
            "Central"
        ))

    # Seed verified Agricultural Experts
    experts = [
        {
            "phone": "9880112233",
            "name": "Dr. Ramesh Patil",
            "role": "expert",
            "language": "kn",
            "district": "Dharwad",
            "taluk": "Dharwad",
            "village": "UAS Campus",
            "title": "Principal Scientist (Agronomy)",
            "specialization": "Cereals, Pulses & Integrated Pest Management (ICAR-UAS)",
            "verified": 1
        },
        {
            "phone": "9880445566",
            "name": "Dr. Sunitha Gowda",
            "role": "expert",
            "language": "kn",
            "district": "Mandya",
            "taluk": "Pandavapura",
            "village": "ZARS V.C. Farm",
            "title": "Associate Professor (Horticulture)",
            "specialization": "Vegetable Pathology & Organic Formulations (GKVK/UAS)",
            "verified": 1
        },
        {
            "phone": "9880778899",
            "name": "Dr. Anand Kumar",
            "role": "expert",
            "language": "hi",
            "district": "Tumakuru",
            "taluk": "Hirehalli",
            "village": "KVK Center",
            "title": "Senior Entomologist",
            "specialization": "Biological Pest Control & Soil Micro-nutrients (ICAR-IIHR)",
            "verified": 1
        }
    ]

    for exp in experts:
        cursor.execute("SELECT id FROM users WHERE phone = ?", (exp["phone"],))
        if not cursor.fetchone():
            pwd_hash, salt = hash_password("Expert@Kisan2026")
            cursor.execute("""
            INSERT INTO users (phone, name, password_hash, salt, role, language, district, taluk, village, expert_title, expert_specialization, is_verified_expert)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                exp["phone"],
                exp["name"],
                pwd_hash,
                salt,
                exp["role"],
                exp["language"],
                exp["district"],
                exp["taluk"],
                exp["village"],
                exp["title"],
                exp["specialization"],
                exp["verified"]
            ))

    # Seed demo farmer account for immediate testing
    cursor.execute("SELECT id FROM users WHERE phone = ?", ("9845012345",))
    if not cursor.fetchone():
        pwd_hash, salt = hash_password("Farmer@123")
        cursor.execute("""
        INSERT INTO users (phone, name, password_hash, salt, role, language, state, district, taluk, village, land_acres, soil_type, irrigation_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "9845012345",
            "Ninge Gowda (ನಿಂಗೇ ಗೌಡ)",
            pwd_hash,
            salt,
            "farmer",
            "kn",
            "Karnataka",
            "Mandya",
            "Pandavapura",
            "Melukote",
            3.5,
            "Red Sandy Loam",
            "Canal & Borewell"
        ))
        farmer_id = cursor.lastrowid

        # Seed sample crops for the demo farmer
        cursor.execute("""
        INSERT INTO farm_crops (user_id, crop_name, variety, sowing_date, acreage, growth_stage, soil_health_notes)
        VALUES 
        (?, 'Ragi (Finger Millet)', 'ML-365 (High Yielding)', '2026-08-15', 2.0, 'Maturity / Grain Filling', 'Treated with Trichoderma; NPK applied as per UAS recommendation'),
        (?, 'Tomato', 'Shivani Hybrid', '2026-09-20', 1.5, 'Flowering & Fruit Setting', 'Drip fertigation; Neem cake incorporated at basal dressing')
        """, (farmer_id, farmer_id))

        # Seed sample community post
        cursor.execute("""
        INSERT INTO community_posts (user_id, author_name, author_role, crop_tag, title, body, upvotes, expert_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            farmer_id,
            "Ninge Gowda",
            "farmer",
            "Tomato",
            "Controlling Leaf Curl in Shivani Hybrid during October",
            "I noticed silvering and slight curling on young tomato shoots last week. Spraying 5ml neem oil with soap emulsion early morning controlled the whiteflies without costly chemicals. Sharing for fellow growers.",
            14,
            1
        ))
        post_id = cursor.lastrowid

        # Add expert reply
        cursor.execute("SELECT id FROM users WHERE phone = ?", ("9880445566",))
        exp_row = cursor.fetchone()
        if exp_row:
            cursor.execute("""
            INSERT INTO community_replies (post_id, user_id, author_name, author_role, body, is_expert_answer)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                post_id,
                exp_row["id"],
                "Dr. Sunitha Gowda (GKVK)",
                "expert",
                "Excellent cultural practice, Ninge Gowda. Whitefly (Bemisia tabaci) is the primary vector for Tomato Leaf Curl Virus. Installing yellow sticky traps (15 traps/acre) alongside neem oil spray gives >90% vector control.",
                1
            ))
