"""
Admin authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta

from db_session import get_db
from auth import (
    verify_password, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    security
)
from database import AdminUser

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def admin_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Admin login endpoint - returns JWT token"""
    # Authenticate user
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "success": True,
        "user": {
            "username": user.username,
            "email": user.email
        }
    }


@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user info"""
    user = get_current_user(credentials, db)
    return {
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active
    }


@router.post("/logout")
async def logout():
    """Logout endpoint (client should discard token)"""
    return {"success": True, "message": "Logged out successfully"}
