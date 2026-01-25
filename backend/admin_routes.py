"""
Admin API routes for content management
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
from PIL import Image as PILImage
import json

from database import Project, Blog, Image, Service, AdminUser
from db_session import get_db
from auth import get_current_user_optional, get_current_user, verify_password, get_password_hash
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(tags=["admin"])

# Ensure upload directories exist
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOAD_DIR = os.path.join(STATIC_DIR, "uploads")
IMAGES_DIR = os.path.join(STATIC_DIR, "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)


security = HTTPBearer(auto_error=False)


def get_current_user_from_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user from bearer token for API routes"""
    # Try bearer token from Authorization header
    if credentials:
        try:
            return get_current_user(credentials, db)
        except HTTPException:
            pass
    
    # Try to get token from Authorization header manually
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # Create credentials object
        from fastapi.security import HTTPAuthorizationCredentials
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        try:
            return get_current_user(creds, db)
        except HTTPException:
            pass
    
    # Fallback to optional (for backwards compatibility)
    user = get_current_user_optional(request, db)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    return user


# ==================== IMAGE MANAGEMENT ====================

@router.post("/images/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form("general"),
    alt_text: str = Form(""),
    is_profile: bool = Form(False),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Upload an image file"""
    current_user = get_current_user_from_request(request, credentials, db)
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{category}_{timestamp}{file_ext}"
        file_path = os.path.join(IMAGES_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create database record
        db_image = Image(
            filename=filename,
            original_filename=file.filename,
            file_path=f"/static/images/{filename}",
            file_size=file_size,
            mime_type=file.content_type,
            alt_text=alt_text,
            category=category,
            is_profile=is_profile
        )
        
        # If this is a profile image, unset others
        if is_profile:
            db.query(Image).filter(Image.is_profile == True).update({"is_profile": False})
        
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        
        return {
            "success": True,
            "image": {
                "id": db_image.id,
                "filename": db_image.filename,
                "url": db_image.file_path,
                "category": db_image.category
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/images")
async def list_images(
    request: Request,
    category: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """List all images"""
    current_user = get_current_user_from_request(request, credentials, db)
    query = db.query(Image)
    if category:
        query = query.filter(Image.category == category)
    
    images = query.order_by(Image.created_at.desc()).all()
    
    return {
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "url": img.file_path,
                "category": img.category,
                "alt_text": img.alt_text,
                "is_profile": img.is_profile,
                "created_at": img.created_at.isoformat()
            }
            for img in images
        ]
    }


@router.delete("/images/{image_id}")
async def delete_image(
    request: Request,
    image_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete an image"""
    current_user = get_current_user_from_request(request, credentials, db)
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file
    file_path = os.path.join(IMAGES_DIR, image.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete database record
    db.delete(image)
    db.commit()
    
    return {"success": True, "message": "Image deleted successfully"}


@router.post("/images/{image_id}/set-profile")
async def set_profile_image(
    request: Request,
    image_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Set an image as the profile image"""
    current_user = get_current_user_from_request(request, credentials, db)
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Unset all other profile images
    db.query(Image).filter(Image.is_profile == True).update({"is_profile": False})
    
    # Set this image as profile
    image.is_profile = True
    db.commit()
    
    return {"success": True, "message": "Profile image set successfully"}


# ==================== PROJECT MANAGEMENT ====================

@router.get("/projects")
async def list_projects(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """List all projects"""
    current_user = get_current_user_from_request(request, credentials, db)
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    
    return {
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "url": p.url,
                "github_url": p.github_url,
                "image_url": p.image_url,
                "stars": p.stars,
                "forks": p.forks,
                "language": p.language,
                "featured": p.featured,
                "created_at": p.created_at.isoformat()
            }
            for p in projects
        ]
    }


@router.post("/projects")
async def create_project(
    request: Request,
    name: str = Form(...),
    description: str = Form(""),
    url: str = Form(""),
    github_url: str = Form(""),
    image_url: str = Form(""),
    stars: int = Form(0),
    forks: int = Form(0),
    language: str = Form(""),
    featured: bool = Form(False),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    current_user = get_current_user_from_request(request, credentials, db)
    project = Project(
        name=name,
        description=description,
        url=url,
        github_url=github_url,
        image_url=image_url,
        stars=stars,
        forks=forks,
        language=language,
        featured=featured
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return {
        "success": True,
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description
        }
    }


@router.put("/projects/{project_id}")
async def update_project(
    request: Request,
    project_id: int,
    name: str = Form(...),
    description: str = Form(""),
    url: str = Form(""),
    github_url: str = Form(""),
    image_url: str = Form(""),
    stars: int = Form(0),
    forks: int = Form(0),
    language: str = Form(""),
    featured: bool = Form(False),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update a project"""
    current_user = get_current_user_from_request(request, credentials, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.name = name
    project.description = description
    project.url = url
    project.github_url = github_url
    project.image_url = image_url
    project.stars = stars
    project.forks = forks
    project.language = language
    project.featured = featured
    project.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(project)
    
    return {"success": True, "message": "Project updated successfully"}


@router.delete("/projects/{project_id}")
async def delete_project(
    request: Request,
    project_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    current_user = get_current_user_from_request(request, credentials, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    
    return {"success": True, "message": "Project deleted successfully"}


# ==================== BLOG MANAGEMENT ====================

@router.get("/blogs")
async def list_blogs(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """List all blogs"""
    current_user = get_current_user_from_request(request, credentials, db)
    blogs = db.query(Blog).order_by(Blog.created_at.desc()).all()
    
    return {
        "blogs": [
            {
                "id": b.id,
                "title": b.title,
                "description": b.description,
                "category": b.category,
                "tags": b.tags,
                "link": b.link,
                "image_url": b.image_url,
                "published": b.published,
                "created_at": b.created_at.isoformat()
            }
            for b in blogs
        ]
    }


@router.post("/blogs")
async def create_blog(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    content: str = Form(""),
    category: str = Form(""),
    tags: str = Form(""),
    link: str = Form(""),
    image_url: str = Form(""),
    published: bool = Form(False),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new blog post"""
    current_user = get_current_user_from_request(request, credentials, db)
    blog = Blog(
        title=title,
        description=description,
        content=content,
        category=category,
        tags=tags,
        link=link,
        image_url=image_url,
        published=published
    )
    
    db.add(blog)
    db.commit()
    db.refresh(blog)
    
    return {"success": True, "message": "Blog created successfully"}


@router.put("/blogs/{blog_id}")
async def update_blog(
    request: Request,
    blog_id: int,
    title: str = Form(...),
    description: str = Form(""),
    content: str = Form(""),
    category: str = Form(""),
    tags: str = Form(""),
    link: str = Form(""),
    image_url: str = Form(""),
    published: bool = Form(False),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update a blog post"""
    current_user = get_current_user_from_request(request, credentials, db)
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    blog.title = title
    blog.description = description
    blog.content = content
    blog.category = category
    blog.tags = tags
    blog.link = link
    blog.image_url = image_url
    blog.published = published
    blog.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(blog)
    
    return {"success": True, "message": "Blog updated successfully"}


@router.delete("/blogs/{blog_id}")
async def delete_blog(
    request: Request,
    blog_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a blog post"""
    current_user = get_current_user_from_request(request, credentials, db)
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db.delete(blog)
    db.commit()
    
    return {"success": True, "message": "Blog deleted successfully"}


# ==================== SERVICE MANAGEMENT ====================

@router.get("/services")
async def list_services(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """List all services"""
    current_user = get_current_user_from_request(request, credentials, db)
    services = db.query(Service).order_by(Service.order).all()
    
    return {
        "services": [
            {
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "icon": s.icon,
                "features": s.features,
                "order": s.order,
                "visible": s.visible
            }
            for s in services
        ]
    }


@router.post("/services")
async def create_service(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    icon: str = Form(""),
    features: str = Form(""),
    order: int = Form(0),
    visible: bool = Form(True),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Create a new service"""
    current_user = get_current_user_from_request(request, credentials, db)
    service = Service(
        title=title,
        description=description,
        icon=icon,
        features=features,
        order=order,
        visible=visible
    )
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return {"success": True, "message": "Service created successfully"}


@router.put("/services/{service_id}")
async def update_service(
    request: Request,
    service_id: int,
    title: str = Form(...),
    description: str = Form(""),
    icon: str = Form(""),
    features: str = Form(""),
    order: int = Form(0),
    visible: bool = Form(True),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update a service"""
    current_user = get_current_user_from_request(request, credentials, db)
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.title = title
    service.description = description
    service.icon = icon
    service.features = features
    service.order = order
    service.visible = visible
    service.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(service)
    
    return {"success": True, "message": "Service updated successfully"}


@router.delete("/services/{service_id}")
async def delete_service(
    request: Request,
    service_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a service"""
    current_user = get_current_user_from_request(request, credentials, db)
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(service)
    db.commit()
    
    return {"success": True, "message": "Service deleted successfully"}


# ==================== SETTINGS / ACCOUNT MANAGEMENT ====================

@router.get("/settings/profile")
async def get_profile(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current admin profile"""
    current_user = get_current_user_from_request(request, credentials, db)
    return {
        "success": True,
        "profile": {
            "username": current_user.username,
            "email": current_user.email
        }
    }


@router.put("/settings/profile")
async def update_profile(
    request: Request,
    email: str = Form(""),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update admin profile"""
    current_user = get_current_user_from_request(request, credentials, db)
    
    if email:
        current_user.email = email
    
    db.commit()
    db.refresh(current_user)
    
    return {"success": True, "message": "Profile updated successfully"}


@router.post("/settings/change-password")
async def change_password(
    request: Request,
    current_password: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Change admin password"""
    current_user = get_current_user_from_request(request, credentials, db)
    
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Check new password confirmation
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    
    # Validate new password length
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"success": True, "message": "Password changed successfully"}