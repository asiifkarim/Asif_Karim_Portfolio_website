"""
Public API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
import requests
import json
import os

from database import Blog, Image
from db_session import get_db

router = APIRouter()

# GitHub API configuration
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "asiifkarim")
GITHUB_API_URL = f"https://api.github.com/users/{GITHUB_USERNAME}/repos"

# Backend paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# Data file paths
BLOGS_FILE = os.path.join(DATA_DIR, "blogs.json")
CONTACTS_FILE = os.path.join(DATA_DIR, "contacts.json")

def load_json_data(file_path: str, default: List = None) -> List:
    """Load JSON data from file, return default if file doesn't exist"""
    if default is None:
        default = []
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return default
    return default

@router.get("/projects")
async def get_projects():
    """Fetch GitHub repositories and return as JSON"""
    try:
        response = requests.get(GITHUB_API_URL, timeout=10)
        response.raise_for_status()
        
        repos = response.json()
        
        # Filter and format repository data
        projects = []
        for repo in repos:
            # Skip forks and private repos
            if repo.get('fork', False) or repo.get('private', False):
                continue
                
            project = {
                "name": repo.get('name', ''),
                "description": repo.get('description', 'No description available'),
                "stars": repo.get('stargazers_count', 0),
                "forks": repo.get('forks_count', 0),
                "url": repo.get('html_url', ''),
                "language": repo.get('language', ''),
                "updated_at": repo.get('updated_at', '')
            }
            projects.append(project)
        
        # Sort by stars (descending)
        projects.sort(key=lambda x: x['stars'], reverse=True)
        
        return {"projects": projects}
        
    except requests.RequestException as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to fetch GitHub data: {str(e)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Unexpected error: {str(e)}"}
        )

@router.get("/profile-image")
async def get_profile_image(db: Session = Depends(get_db)):
    """Get profile image URL"""
    try:
        profile_image = db.query(Image).filter(Image.is_profile == True).first()
        if profile_image:
            return {"url": profile_image.file_path, "alt": profile_image.alt_text or "Profile Image"}
        else:
            # Fallback to default
            default_url = os.getenv("DEFAULT_PROFILE_IMAGE", "/static/images/profile_20251029_145835.png")
            return {"url": default_url, "alt": "Profile Image"}
    except Exception as e:
        default_url = os.getenv("DEFAULT_PROFILE_IMAGE", "/static/images/profile_20251029_145835.png")
        return {"url": default_url, "alt": "Profile Image"}

@router.get("/blogs")
async def get_blogs(db: Session = Depends(get_db)):
    """Return blog entries from database"""
    try:
        blogs_db = db.query(Blog).filter(Blog.published == True).order_by(Blog.created_at.desc()).all()
        
        blogs = []
        for b in blogs_db:
            tags_list = b.tags.split(',') if b.tags else []
            blogs.append({
                "id": b.id,
                "title": b.title,
                "description": b.description,
                "date": b.created_at.isoformat(),
                "category": b.category or "General",
                "tags": tags_list,
                "link": b.link or f"/blogs/{b.id}",
                "image_url": b.image_url
            })
        
        # Fallback to JSON if no database blogs
        if not blogs:
            blogs = load_json_data(BLOGS_FILE, [])
        
        return {"blogs": blogs}
    except Exception as e:
        # Fallback to JSON
        blogs = load_json_data(BLOGS_FILE, [])
        return {"blogs": blogs}

@router.post("/contact")
async def submit_contact(
    name: str,
    email: str,
    message: str
):
    """Handle contact form submission"""
    from datetime import datetime
    
    try:
        # Load existing contacts
        contacts = load_json_data(CONTACTS_FILE, [])
        
        # Create new contact entry
        new_contact = {
            "id": len(contacts) + 1,
            "name": name,
            "email": email,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to contacts list
        contacts.append(new_contact)
        
        # Save to file
        os.makedirs(os.path.dirname(CONTACTS_FILE), exist_ok=True)
        with open(CONTACTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(contacts, f, indent=2, ensure_ascii=False)
        
        return {"success": True, "message": "Thank you for your message! I'll get back to you soon."}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Failed to save message: {str(e)}"}
        )

