"""
Production-ready FastAPI backend for Portfolio API
"""
from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database imports
from database import Project, Blog, Image
from db_session import get_db, init_db
from auth import create_default_admin

# API routes
from api import router as api_router
from admin_routes import router as admin_router
from admin_auth import router as admin_auth_router

# Initialize database on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    db = next(get_db())
    try:
        create_default_admin(db)
    except Exception as e:
        print(f"Note: Could not create default admin - {e}")
    finally:
        db.close()
    yield
    # Shutdown (if needed)

# Create FastAPI app
app = FastAPI(
    title="Asif Karim Portfolio API",
    description="Backend API for personal portfolio website",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve important paths inside the backend folder
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BACKEND_DIR, "static")
TEMPLATES_DIR = os.path.join(BACKEND_DIR, "templates")
DATA_DIR = os.path.join(BACKEND_DIR, "data")

# Mount static files from project root so templates can use /static/* paths
os.makedirs(os.path.join(STATIC_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Templates (use project-level templates directory)
templates = Jinja2Templates(directory=TEMPLATES_DIR)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})


@app.get("/projects", response_class=HTMLResponse)
async def projects(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request})


@app.get("/services", response_class=HTMLResponse)
async def services(request: Request):
    return templates.TemplateResponse("services.html", {"request": request})


@app.get("/blogs", response_class=HTMLResponse)
async def blogs(request: Request):
    return templates.TemplateResponse("blogs.html", {"request": request})


@app.get("/contact", response_class=HTMLResponse)
async def contact(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request})


# Admin page routes
@app.get("/admin/login", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    """Admin login page"""
    return templates.TemplateResponse("admin/login.html", {"request": request})


@app.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard_page(request: Request):
    """Admin dashboard page"""
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})


@app.post("/contact")
async def submit_contact(
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...)
):
    # Delegate to API-style contact handler: save to data/contacts.json
    from datetime import datetime
    import json

    CONTACTS_FILE = os.path.join(DATA_DIR, "contacts.json")
    try:
        os.makedirs(os.path.dirname(CONTACTS_FILE), exist_ok=True)
        contacts = []
        if os.path.exists(CONTACTS_FILE):
            with open(CONTACTS_FILE, 'r', encoding='utf-8') as f:
                try:
                    contacts = json.load(f)
                except Exception:
                    contacts = []

        new_contact = {
            "id": len(contacts) + 1,
            "name": name,
            "email": email,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }

        contacts.append(new_contact)
        with open(CONTACTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(contacts, f, indent=2, ensure_ascii=False)

        return {"success": True, "message": "Thank you for your message!"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Include routers
app.include_router(api_router, prefix="/api", tags=["api"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(admin_auth_router, tags=["auth"])

@app.get("/api/info")
async def api_info():
    """API information endpoint"""
    return {
        "message": "Portfolio API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

