# 🚀 AI Developer Portfolio

<div align="center">

![Portfolio Banner](https://img.shields.io/badge/Portfolio-AI%20Developer-6366f1?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**A modern, professional portfolio website for AI Developers and Data Scientists**

[Live Demo](#) • [Features](#-features) • [Quick Start](#-quick-start) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## 🌟 Overview

A full-stack portfolio website designed for AI Developers and Data Scientists. Features a modern glassmorphism design with teal & coral theme, admin CMS for content management, and seamless API integration.

### ✨ Key Highlights

- 🎨 **Modern UI/UX** - Glassmorphism effects, smooth animations, responsive design
- 🔐 **Admin CMS** - Manage projects, blogs, services without touching code
- 🚀 **Fast & Lightweight** - Built with FastAPI for blazing-fast performance
- 📱 **Fully Responsive** - Perfect on desktop, tablet, and mobile
- 🌓 **Dark/Light Mode** - Theme toggle for user preference
- 🔌 **API-Driven** - RESTful API architecture
- 📊 **GitHub Integration** - Automatically fetch and display repositories
- 📝 **Blog System** - Share knowledge and insights
- 📧 **Contact Form** - Integrated contact management

---

## 🎯 Features

### Frontend
✅ Hero section with animated code preview  
✅ About page with skills, timeline, and profile  
✅ Projects page with GitHub API integration  
✅ Services showcase  
✅ Blog system with categories and tags  
✅ Contact form with validation  
✅ Smooth scroll animations  
✅ Theme toggle (dark/light mode)  
✅ Mobile-responsive navigation  

### Backend
✅ FastAPI REST API  
✅ SQLite database with SQLAlchemy ORM  
✅ JWT authentication for admin  
✅ Image upload and management  
✅ CRUD operations for all content  
✅ GitHub API integration  
✅ CORS enabled  
✅ Automatic API documentation (Swagger UI)  

### Admin Panel
✅ Secure login with JWT tokens  
✅ Dashboard for content management  
✅ Image upload with drag & drop  
✅ Project, blog, and service management  
✅ Contact form submissions view  

---

## 🛠️ Tech Stack

**Backend:**
- FastAPI 0.104.1
- SQLAlchemy 2.0.46
- Python 3.11+
- JWT Authentication
- Uvicorn Server

**Frontend:**
- HTML5, CSS3, JavaScript
- Modern CSS (Grid, Flexbox, Variables)
- Font Awesome Icons
- Google Fonts (Poppins)

---

## 📁 Project Structure

```
portfolio/
├── backend/                    # FastAPI Backend
│   ├── static/                # Static assets (CSS, JS, images)
│   ├── templates/             # Jinja2 templates
│   ├── data/                  # JSON data storage
│   ├── app.py                 # Main application
│   ├── api.py                 # Public API routes
│   ├── admin_routes.py        # Admin API routes
│   ├── admin_auth.py          # Authentication routes
│   ├── database.py            # Database models
│   ├── db_session.py          # Database session
│   ├── auth.py                # Auth utilities
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Static Frontend
│   ├── src/                   # HTML source files
│   │   ├── css/              # Stylesheets
│   │   ├── js/               # JavaScript files
│   │   ├── images/           # Image assets
│   │   ├── index.html        # Home page
│   │   ├── about.html        # About page
│   │   ├── projects.html     # Projects page
│   │   ├── services.html     # Services page
│   │   ├── blogs.html        # Blog page
│   │   ├── contact.html      # Contact page
│   │   └── config.js         # API configuration
│   └── public/                # Public assets (backup)
│
├── .gitignore                 # Git ignore rules
├── Dockerfile                 # Docker configuration
├── Procfile                   # Heroku deployment
├── runtime.txt                # Python version
├── LICENSE                    # MIT License
├── README.md                  # This file
└── GITHUB_DEPLOYMENT_GUIDE.md # Deployment guide
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip (Python package installer)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. **Create virtual environment**
```bash
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Run the backend**
```bash
python app.py
```

The backend will start at `http://localhost:8000`

5. **Run the frontend (in a new terminal)**
```bash
cd frontend/src
python -m http.server 3000
```

The frontend will start at `http://localhost:3000`

### Access the Application

- **Website**: http://localhost:3000/index.html
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:8000/admin/login

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

---

## 🌐 Deployment

See [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options

#### Option 1: Render (Recommended - Free Tier)
1. Push code to GitHub
2. Create account on [Render](https://render.com)
3. Create Web Service for backend
4. Create Static Site for frontend
5. Configure environment variables

#### Option 2: Railway
1. Push code to GitHub
2. Create account on [Railway](https://railway.app)
3. Deploy from GitHub repo
4. Auto-detects and deploys

#### Option 3: Vercel (Frontend) + Render (Backend)
1. Deploy frontend to [Vercel](https://vercel.com)
2. Deploy backend to [Render](https://render.com)
3. Update API URL in frontend config

---

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=8000
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-url.com
GITHUB_USERNAME=yourusername
```

### Frontend (config.js)

```javascript
const CONFIG = {
    BASE_URL: 'http://localhost:8000',  // Change to your backend URL in production
    // ...
};
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Public Endpoints

```
GET  /api/projects        - Fetch GitHub repositories
GET  /api/blogs          - Get published blog posts
GET  /api/profile-image  - Get profile image URL
POST /api/contact        - Submit contact form
GET  /health             - Health check
```

### Admin Endpoints (Requires Authentication)

```
POST   /api/auth/login              - Admin login
GET    /api/auth/me                 - Get current user
POST   /api/admin/images/upload     - Upload image
GET    /api/admin/images            - List images
DELETE /api/admin/images/{id}       - Delete image
POST   /api/admin/projects          - Create project
PUT    /api/admin/projects/{id}     - Update project
DELETE /api/admin/projects/{id}     - Delete project
POST   /api/admin/blogs             - Create blog
PUT    /api/admin/blogs/{id}        - Update blog
DELETE /api/admin/blogs/{id}        - Delete blog
POST   /api/admin/services          - Create service
PUT    /api/admin/services/{id}     - Update service
DELETE /api/admin/services/{id}     - Delete service
```

---

## 🎨 Customization

### Update Personal Information

1. **GitHub Username**: Edit `backend/api.py` line 18
2. **Contact Info**: Edit templates in `backend/templates/`
3. **Social Links**: Update footer in `backend/templates/base.html`
4. **Profile Image**: Upload via admin panel
5. **About Content**: Edit `backend/templates/about.html`

### Customize Colors

Edit `frontend/src/css/style.css`:

```css
:root {
  --primary-color: #0d9488;    /* Teal */
  --secondary-color: #f43f5e;  /* Coral */
  --accent-color: #06b6d4;     /* Sky Blue */
  /* ... more colors */
}
```

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Asif Karim**

- GitHub: [@asiifkarim](https://github.com/asiifkarim)
- LinkedIn: [asifkarim1](https://linkedin.com/in/asifkarim1)
- Email: asiif.krm@gmail.com

---

## 🙏 Acknowledgments

- FastAPI team for the excellent framework
- Font Awesome for the icons
- Google Fonts for typography
- All open-source contributors

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Asif Karim](https://github.com/asiifkarim)

</div>
