# 🚀 GitHub Deployment Guide

## Step-by-Step Guide to Push Your Portfolio to GitHub

### 📋 Prerequisites
- Git installed on your computer
- GitHub account created
- Your portfolio code ready

---

## 🎯 Option 1: Single Repository (RECOMMENDED)

### Why Single Repo?
✅ Easier to manage  
✅ Better for deployment platforms  
✅ Backend can serve frontend  
✅ Simpler CI/CD setup  

### Steps:

#### 1. Initialize Git Repository
```bash
# Navigate to your project root
cd D:\portfolio\portfolio

# Initialize git
git init

# Check status
git status
```

#### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `portfolio` or `ai-developer-portfolio`
3. Description: "AI Developer Portfolio - FastAPI Backend + Static Frontend"
4. Choose: **Public** (for free hosting) or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

#### 3. Add Files to Git
```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit with message
git commit -m "Initial commit: AI Developer Portfolio with FastAPI backend and static frontend"
```

#### 4. Connect to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 5. Verify on GitHub
- Go to your repository URL
- You should see all your files uploaded

---

## 🌐 Deployment Options

### Option A: Render (RECOMMENDED - Free Tier)

**Backend Deployment:**
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: `portfolio-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `SECRET_KEY`: (generate a random string)
   - `ALLOWED_ORIGINS`: `*` (or your frontend URL)
7. Click "Create Web Service"

**Frontend Deployment:**
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `portfolio-frontend`
   - **Root Directory**: `frontend/src`
   - **Publish Directory**: `.`
4. Update `frontend/src/config.js`:
   ```javascript
   BASE_URL: 'https://portfolio-backend.onrender.com'
   ```
5. Click "Create Static Site"

### Option B: Railway (Easy & Fast)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Python and deploys
6. Add environment variables in settings
7. Get your deployment URL

### Option C: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend/src`
   - **Framework Preset**: Other
4. Deploy

**Backend on Render:**
- Follow Render backend steps above

### Option D: Heroku (Classic Option)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-portfolio-name`
4. Set buildpack: `heroku buildpacks:set heroku/python`
5. Push: `git push heroku main`

---

## 📝 Important Files for Deployment

### 1. Create `requirements.txt` (if not exists)
Already exists in `backend/requirements.txt`

### 2. Create `Procfile` (for Heroku)
Already exists: `web: cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`

### 3. Create `runtime.txt` (for Heroku)
Already exists: `python-3.11.0`

### 4. Update `backend/.env.example`
```env
PORT=8000
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-url.com
GITHUB_USERNAME=asiifkarim
```

---

## 🔧 Post-Deployment Configuration

### Update Frontend API URL
After deploying backend, update `frontend/src/config.js`:
```javascript
const CONFIG = {
    BASE_URL: 'https://your-backend-url.onrender.com',  // Your deployed backend URL
    // ... rest of config
};
```

### Update CORS Settings
In `backend/app.py`, update allowed origins:
```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
    "http://localhost:3000,https://your-frontend-url.com"
).split(",")
```

---

## 🎨 Custom Domain (Optional)

### For Render:
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

### For Vercel:
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration

---

## 🔐 Environment Variables to Set

**Backend:**
- `SECRET_KEY`: Random string for JWT (generate with: `openssl rand -hex 32`)
- `ALLOWED_ORIGINS`: Your frontend URL(s)
- `GITHUB_USERNAME`: Your GitHub username
- `PORT`: Usually auto-set by platform

**Frontend:**
- Update `config.js` with backend URL (no env vars needed for static site)

---

## 📊 Monitoring & Maintenance

### Check Logs:
- **Render**: Dashboard → Logs tab
- **Railway**: Project → Deployments → Logs
- **Heroku**: `heroku logs --tail`

### Update Deployment:
```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push origin main
```

Most platforms auto-deploy on push to main branch.

---

## 🆘 Troubleshooting

### Issue: Backend not starting
- Check logs for errors
- Verify all dependencies in requirements.txt
- Check environment variables are set

### Issue: Frontend can't connect to backend
- Verify CORS settings in backend
- Check API URL in frontend config.js
- Ensure backend is running

### Issue: Database errors
- SQLite works for development
- For production, consider PostgreSQL
- Render/Railway offer free PostgreSQL

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

## ✅ Deployment Checklist

- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables configured
- [ ] Frontend API URL updated
- [ ] CORS settings updated
- [ ] Test all pages work
- [ ] Test contact form
- [ ] Test admin panel
- [ ] Custom domain configured (optional)

---

**Need Help?** Open an issue on GitHub or contact me!

Made with ❤️ by Asif Karim
