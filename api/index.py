import sys
import os
import traceback
from pathlib import Path

# Add project root to sys.path so 'backend' package is always importable on Vercel
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from backend.main import app
    try:
        from mangum import Mangum
        handler = Mangum(app, lifespan="off")
    except Exception as me:
        print(f"[Mangum Notice] {me}")
        handler = app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="Kisan Setu Error Fallback")
    err_details = traceback.format_exc()
    print(f"[VERCEL STARTUP ERROR] {err_details}", file=sys.stderr)
    
    @app.api_route("/", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    async def vercel_error_fallback(full_path: str = ""):
        return JSONResponse(
            {
                "status": "startup_error",
                "error": str(err_details),
                "message": "Kisan Setu serverless function encountered an error during startup."
            },
            status_code=500
        )
    try:
        from mangum import Mangum
        handler = Mangum(app, lifespan="off")
    except Exception:
        handler = app
