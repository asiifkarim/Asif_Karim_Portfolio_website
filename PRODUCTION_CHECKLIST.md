# 🚀 Production Deployment Checklist

## Pre-Deployment Checklist

### Security
- [ ] Change default admin password (admin/admin123)
- [ ] Generate strong SECRET_KEY for JWT tokens
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Update ALLOWED_ORIGINS with your frontend URL
- [ ] Remove any hardcoded credentials
- [ ] Review and update .gitignore
- [ ] Ensure .env file is NOT committed to git

### Configuration
- [ ] Update GITHUB_USERNAME in backend/api.py or .env
- [ ] Update frontend/src/config.js with production backend URL
- [ ] Update social media links in templates
- [ ] Update contact information
- [ ] Set correct PORT for your hosting platform

### Database
- [ ] Ensure portfolio.db is in .gitignore
- [ ] Database will be created automatically on first run
- [ ] For production, consider PostgreSQL instead of SQLite

### Content
- [ ] Upload profile image via admin panel
- [ ] Add your projects via admin panel
- [ ] Create blog posts
- [ ] Add services/offerings
- [ ] Test contact form

### Testing
- [ ] Test all pages load correctly
- [ ] Test responsive design on mobile
- [ ] Test dark/light theme toggle
- [ ] Test admin login
- [ ] Test image upload
- [ ] Test contact form submission
- [ ] Test GitHub projects integration
- [ ] Check browser console for errors
- [ ] Test API endpoints via /docs

### Performance
- [ ] Optimize images (compress large files)
- [ ] Test page load speed
- [ ] Check mobile performance
- [ ] Verify CORS settings

### SEO & Meta
- [ ] Update meta descriptions in HTML files
- [ ] Add Open Graph tags
- [ ] Add favicon
- [ ] Create sitemap.xml (optional)
- [ ] Add robots.txt (optional)

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Production-ready portfolio"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

### 2. Deploy Backend (Choose One)

#### Option A: Render
1. Create account at render.com
2. New Web Service → Connect GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

#### Option B: Railway
1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

#### Option C: Heroku
```bash
heroku create your-app-name
heroku config:set SECRET_KEY=your-secret-key
heroku config:set GITHUB_USERNAME=yourusername
git push heroku main
```

### 3. Deploy Frontend (Choose One)

#### Option A: Render Static Site
1. New Static Site → Connect GitHub repo
2. Root Directory: `frontend/src`
3. Publish Directory: `.`
4. Deploy

#### Option B: Vercel
1. Import GitHub repository
2. Root Directory: `frontend/src`
3. Framework: Other
4. Deploy

#### Option C: Netlify
1. Import from GitHub
2. Publish directory: `frontend/src`
3. Deploy

### 4. Post-Deployment

- [ ] Update frontend config.js with backend URL
- [ ] Test all functionality on live site
- [ ] Update README with live demo link
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (usually automatic)
- [ ] Set up monitoring/analytics (optional)

## Environment Variables Reference

### Backend (.env)
```env
PORT=8000
SECRET_KEY=<generate-strong-key>
ALLOWED_ORIGINS=https://your-frontend-url.com
GITHUB_USERNAME=yourusername
```

### Frontend (config.js)
```javascript
BASE_URL: 'https://your-backend-url.onrender.com'
```

## Common Issues & Solutions

### Issue: Backend won't start
- Check logs for error messages
- Verify all dependencies installed
- Check environment variables set correctly
- Ensure PORT is correct

### Issue: Frontend can't connect to backend
- Verify CORS settings in backend
- Check API URL in frontend config.js
- Ensure backend is running and accessible
- Check browser console for CORS errors

### Issue: Database errors
- SQLite works for small projects
- For production with high traffic, use PostgreSQL
- Ensure database file has write permissions

### Issue: Images not loading
- Check image paths are correct
- Verify images uploaded via admin panel
- Check static file serving configuration

### Issue: Admin login fails
- Verify SECRET_KEY is set
- Check default credentials (admin/admin123)
- Check browser console for errors
- Verify JWT token generation

## Monitoring

### Check Application Health
```bash
curl https://your-backend-url.com/health
```

### View Logs
- **Render**: Dashboard → Logs
- **Railway**: Project → Deployments → Logs
- **Heroku**: `heroku logs --tail`

### Monitor Performance
- Use platform's built-in monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Track error rates

## Maintenance

### Regular Updates
- [ ] Update dependencies regularly
- [ ] Monitor security advisories
- [ ] Backup database periodically
- [ ] Review and update content
- [ ] Check for broken links
- [ ] Update portfolio with new projects

### Security Updates
```bash
# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade package-name

# Update requirements.txt
pip freeze > requirements.txt
```

## Rollback Plan

If deployment fails:
1. Check logs for errors
2. Revert to previous commit if needed
3. Redeploy from working commit
4. Fix issues in development first
5. Test thoroughly before redeploying

## Support

If you encounter issues:
1. Check logs first
2. Review this checklist
3. Consult platform documentation
4. Check GitHub issues
5. Contact platform support

---

**Good luck with your deployment! 🚀**

Remember: Test everything in development before deploying to production!
