import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
ENV_PATH = BASE_DIR / ".env"

# Simple .env parser to avoid extra dependency
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# Configuration settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
SECRET_KEY = os.getenv("SECRET_KEY", "kisansetu_default_fallback_secret_key_2026")
DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "kisansetu.db"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Supported Languages
SUPPORTED_LANGUAGES = {
    "kn": "ಕನ್ನಡ (Kannada)",
    "hi": "हिन्दी (Hindi)",
    "en": "English",
    "te": "తెలుగు (Telugu)",
    "ta": "தமிழ் (Tamil)",
    "ml": "മലയാളം (Malayalam)",
    "mr": "मराठी (Marathi)"
}

# Agricultural safety disclaimers
DISCLAIMER_CROP_DIAGNOSIS = (
    "Disclaimer: This AI analysis provides preliminary agronomic indicators based on visual symptoms. "
    "It is NOT a guaranteed laboratory diagnosis. For severe infestations or chemical intervention, "
    "always verify with your local Raitha Samparka Kendra (RSK), KVK, or agricultural university extension officer."
)

DISCLAIMER_SCHEMES = (
    "Disclaimer: Scheme eligibility rules, dates, and subsidy percentages are determined by respective State "
    "and Central Government departments. Subsidies are subject to document verification and departmental sanctions."
)
