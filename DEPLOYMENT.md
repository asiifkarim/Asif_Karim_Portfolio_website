# 🚀 Complete Deployment Guide

## Overview

This guide covers deploying your portfolio with:
- **Frontend**: Vercel (Static Site)
- **Backend**: Railway or Render (FastAPI)
- **CI/CD**: GitHub Actions (Automated testing and deployment)

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up with GitHub)
- [x] Railway or Render account (sign up with GitHub)
- [x] Code pushed to GitHub repository

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
│                  (Monorepo Structure)                    │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │                            │
    ┌────────▼────────┐          ┌───────▼────────┐
    │   GitHub Actions │          │ GitHub Actions │
    │  (Frontend CI)   │          │  (Backend CI)  │
    └────────┬────────┘          └───────┬────────┘
             │                            │
             │                            │
    ┌────────▼────────┐          ┌───────▼────────┐
    │     Vercel      │          │  Railway/Render │
    │   (Frontend)    │◄─────────┤   (Backend)    │
    │  Static Site    │   CORS   │   FastAPI      │
    └─────────────────┘          └────────────────┘
```

---

## 🌐 Part 1: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update API Configuration**

Edit `frontend/src/config.js`:
```javascript
const CONFIG = {
    // Will be replaced with environment variable in production
    BASE_URL: process.env.VITE_API_URL || 'http://localhost:8000',
    // ... rest of config
};
```

2. **Verify vercel.json exists** (already created)

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New Project"**

3. **Import your repository**: `Asif_Karim_Portfolio_website`

4. **Configure Project**:
   ```
   Framework Preset: Other
   Root Directory: frontend/src
   Build Command: (leave empty)
   Output Directory: .
   Install Command: (leave empty)
   ```

5. **Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.railway.app`
   - (You'll update this after deploying backend)

6. Click **"Deploy"**

7. Wait for deployment (usually 1-2 minutes)

8. Get your URL: `https://your-project.vercel.app`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend/src
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
# Enter your backend URL when prompted
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## 🔧 Part 2: Backend Deployment

### Choose Your Platform:

- **Railway**: Easier, auto-detects everything
- **Render**: More configuration options, free tier

---

## 🚂 Option A: Deploy to Railway

### Step 1: Prepare Backend

1. **Verify files exist**:
   - ✅ `railway.json` (already created)
   - ✅ `backend/Dockerfile` (already created)
   - ✅ `backend/requirements.txt`

2. **Update CORS in `backend/app.py`**:
```python
# Update ALLOWED_ORIGINS to include your Vercel domain
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
    "http://localhost:3000,https://your-project.vercel.app"
).split(",")
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub

2. Click **"New Project"**

3. Select **"Deploy from GitHub repo"**

4. Choose: `Asif_Karim_Portfolio_website`

5. Railway will auto-detect Python and deploy!

6. **Configure Environment Variables**:
   - Click on your service
   - Go to **"Variables"** tab
   - Add these variables:

   ```env
   SECRET_KEY=<generate-with-command-below>
   ALLOWED_ORIGINS=https://your-project.vercel.app
   GITHUB_USERNAME=asiifkarim
   PORT=8000
   ```

   Generate SECRET_KEY:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

7. **Get your backend URL**:
   - Go to **"Settings"** → **"Domains"**
   - Copy the Railway URL: `https://your-app.railway.app`

8. **Update Frontend**:
   - Go back to Vercel
   - Update `VITE_API_URL` environment variable with Railway URL
   - Redeploy frontend

### Step 3: Configure Custom Domain (Optional)

1. In Railway, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS records as instructed

---

## 🎨 Option B: Deploy to Render

### Step 1: Prepare Backend

Same as Railway Step 1 above.

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub

2. Click **"New +"** → **"Web Service"**

3. Connect your repository: `Asif_Karim_Portfolio_website`

4. **Configure Service**:
   ```
   Name: portfolio-backend
   Region: Oregon (or closest to you)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
   ```

5. **Select Plan**: Free

6. **Environment Variables**:
   Click "Advanced" and add:
   ```env
   SECRET_KEY=<generate-strong-key>
   ALLOWED_ORIGINS=https://your-project.vercel.app
   GITHUB_USERNAME=asiifkarim
   PYTHON_VERSION=3.11.0
   ```

7. Click **"Create Web Service"**

8. Wait for deployment (3-5 minutes)

9. **Get your backend URL**: `https://portfolio-backend.onrender.com`

10. **Update Frontend** (same as Railway step 8)

### Step 3: Configure Health Checks

Render automatically uses `/health` endpoint for health checks.

---

## 🔄 Part 3: Update Frontend with Backend URL

### After Backend Deployment:

1. **Get Backend URL**:
   - Railway: `https://your-app.railway.app`
   - Render: `https://your-app.onrender.com`

2. **Update Vercel Environment Variable**:
   - Go to Vercel dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Update `VITE_API_URL` with your backend URL
   - Click **"Save"**

3. **Redeploy Frontend**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

4. **Update Backend CORS**:
   - Go to Railway/Render dashboard
   - Update `ALLOWED_ORIGINS` environment variable
   - Add your Vercel URL: `https://your-project.vercel.app`
   - Service will auto-restart

---

## 🔐 Part 4: Security Configuration

### 1. Generate Strong SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Configure CORS Properly

In backend environment variables:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
```

### 3. Change Default Admin Password

1. Visit: `https://your-backend-url.com/admin/login`
2. Login with: `admin` / `admin123`
3. Change password immediately via admin panel

### 4. Enable HTTPS (Automatic)

Both Vercel and Railway/Render provide free SSL certificates automatically.

---

## 🧪 Part 5: Testing Deployment

### Test Backend:

```bash
# Health check
curl https://your-backend-url.com/health

# API docs
open https://your-backend-url.com/docs

# Test API endpoint
curl https://your-backend-url.com/api/projects
```

### Test Frontend:

1. Visit: `https://your-frontend.vercel.app`
2. Check all pages load
3. Test contact form
4. Test admin login
5. Check browser console for errors

### Test Integration:

1. Open frontend in browser
2. Open Developer Tools → Network tab
3. Navigate through pages
4. Verify API calls to backend succeed
5. Check for CORS errors (should be none)

---

## 🔄 Part 6: CI/CD with GitHub Actions

### Already Configured! ✅

Your repository now has:
- `.github/workflows/backend-deploy.yml` - Backend CI/CD
- `.github/workflows/frontend-deploy.yml` - Frontend CI/CD

### What Happens Automatically:

**On Push to Main:**
1. ✅ Code is tested
2. ✅ Docker image is built (backend)
3. ✅ Security checks run
4. ✅ Deployment notification

**On Pull Request:**
1. ✅ Code validation
2. ✅ Tests run
3. ✅ Preview deployment info

### View Workflow Status:

Go to your GitHub repository → **Actions** tab

---

## 📊 Part 7: Monitoring & Maintenance

### Monitor Backend:

**Railway:**
- Dashboard → Metrics
- View logs in real-time
- Monitor CPU/Memory usage

**Render:**
- Dashboard → Logs
- View metrics
- Set up alerts

### Monitor Frontend:

**Vercel:**
- Dashboard → Analytics
- View deployment logs
- Monitor performance

### Set Up Alerts:

1. **Railway/Render**: Configure email alerts for downtime
2. **Vercel**: Enable deployment notifications
3. **GitHub**: Watch repository for issues

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console

**Solution**:
1. Check `ALLOWED_ORIGINS` in backend includes frontend URL
2. Verify `VITE_API_URL` in Vercel points to correct backend
3. Ensure both use HTTPS

### Backend Won't Start

**Problem**: Application error on Railway/Render

**Solution**:
1. Check logs for errors
2. Verify all environment variables are set
3. Ensure `requirements.txt` is complete
4. Check Python version matches

### Database Errors

**Problem**: SQLite database issues

**Solution**:
1. Database is created automatically on first run
2. For production, consider PostgreSQL:
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```
3. Railway/Render offer free PostgreSQL databases

### Deployment Fails

**Problem**: Build or deployment errors

**Solution**:
1. Check GitHub Actions logs
2. Verify all files are committed
3. Check platform-specific logs
4. Ensure root directory is correct

---

## 📚 Environment Variables Reference

### Backend (Railway/Render)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | `abc123...` | JWT secret (generate with Python) |
| `ALLOWED_ORIGINS` | ✅ | `https://app.vercel.app` | Frontend URL for CORS |
| `GITHUB_USERNAME` | ✅ | `asiifkarim` | Your GitHub username |
| `PORT` | ⚠️ | `8000` | Auto-set by platform |
| `DATABASE_URL` | ❌ | `sqlite:///./portfolio.db` | Database connection |

### Frontend (Vercel)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | `https://api.railway.app` | Backend API URL |

---

## 🎉 Deployment Checklist

### Pre-Deployment:
- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Environment variables prepared
- [ ] Strong SECRET_KEY generated

### Backend Deployment:
- [ ] Railway/Render account created
- [ ] Backend deployed successfully
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] API docs accessible

### Frontend Deployment:
- [ ] Vercel account created
- [ ] Frontend deployed successfully
- [ ] VITE_API_URL configured
- [ ] All pages loading correctly

### Post-Deployment:
- [ ] CORS configured correctly
- [ ] Frontend can connect to backend
- [ ] Admin password changed
- [ ] Custom domains configured (optional)
- [ ] Monitoring set up
- [ ] README updated with live URLs

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Actions**: https://github.com/asiifkarim/Asif_Karim_Portfolio_website/actions

---

## 💡 Tips for Success

1. **Always use HTTPS** - Both platforms provide it free
2. **Monitor logs** - Check regularly for errors
3. **Set up alerts** - Get notified of issues
4. **Use environment variables** - Never hardcode secrets
5. **Test thoroughly** - Check all features after deployment
6. **Keep dependencies updated** - Regular maintenance
7. **Backup database** - Export data periodically

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

**Deployment completed! 🎉**

Your portfolio is now live and accessible worldwide!
