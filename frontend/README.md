# Portfolio Frontend

✅ **CONVERSION COMPLETE!** Static frontend for the portfolio website that connects to the backend API.

## Structure

```
frontend/
├── src/              # ✅ Converted HTML files (ready to deploy)
│   ├── index.html    # ✅ Home page
│   ├── about.html    # ✅ About page  
│   ├── projects.html # ✅ Projects page
│   ├── services.html # ✅ Services page
│   ├── blogs.html    # ✅ Blog page
│   ├── contact.html  # ✅ Contact page
│   └── config.js     # ✅ API configuration
├── public/           # Static assets (CSS, JS, images)
└── README.md         # This file
```

## ✅ Conversion Status

All Jinja2 templates have been successfully converted to static HTML:

- **✅ Jinja2 syntax removed** - No more `{% %}` or `{{ }}` 
- **✅ API integration added** - All dynamic content loads from backend API
- **✅ Navigation updated** - Links point to `.html` files
- **✅ Static asset paths fixed** - CSS/JS/images use relative paths
- **✅ JavaScript API calls** - Uses `config.js` for backend communication

## Setup

### 1. Update API Configuration

Edit `src/config.js` and update `BASE_URL` to point to your backend API:

```javascript
BASE_URL: 'https://your-backend-api.hf.space'  // Your deployed backend
```

### 2. Local Development

For local development, you can use any static file server:

```bash
# Using Python (from frontend/ directory)
cd src
python -m http.server 3000

# Using Node.js (http-server)
npx http-server src -p 3000

# Using PHP
cd src && php -S localhost:3000
```

Then open `http://localhost:3000`

### 3. ✅ Ready to Deploy

The HTML files are now ready for deployment to any static hosting service!

## Deployment

### GitHub Pages

1. Push the frontend repository to GitHub
2. Go to Settings > Pages
3. Select the branch and folder (`src` or `public`)
4. Your site will be available at `https://username.github.io/repo-name`

### Netlify

1. Connect your GitHub repository
2. Set build command: (none needed for static site)
3. Set publish directory: `src` or root
4. Add environment variable: `VITE_API_URL` pointing to your backend

### Vercel

1. Import your GitHub repository
2. Framework preset: Other
3. Root directory: `src`
4. Build command: (none)
5. Add environment variable for API URL

## Environment Variables

- `VITE_API_URL`: Backend API URL (defaults to `http://localhost:8000`)

## Features

- Responsive design
- Dark/Light theme toggle
- API-driven content
- Contact form integration
- Projects from GitHub API
- Blog system

