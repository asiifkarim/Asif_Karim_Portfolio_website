# Portfolio Backend API

Production-ready FastAPI backend for the portfolio website.

## Features

- RESTful API endpoints
- JWT authentication
- Admin panel API
- SQLite database with SQLAlchemy
- Image upload support
- GitHub integration
- CORS enabled for frontend integration

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following:
- `SECRET_KEY`: Generate a strong secret key
- `ALLOWED_ORIGINS`: Add your frontend URL(s)
- `GITHUB_USERNAME`: Your GitHub username

### 3. Initialize Database

The database will be created automatically on first run.

### 4. Run the Server

```bash
python app.py
```

Or with uvicorn:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Public Endpoints

- `GET /api/projects` - Get GitHub projects
- `GET /api/blogs` - Get blog posts
- `GET /api/profile-image` - Get profile image
- `POST /api/contact` - Submit contact form
- `GET /health` - Health check
- `GET /docs` - API documentation (Swagger UI)

### Admin Endpoints (Requires Authentication)

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

All admin endpoints require a Bearer token in the Authorization header.

See `/docs` for complete API documentation.

## Deployment

### Hugging Face Spaces

1. Push this repository to GitHub
2. Create a new Space on Hugging Face
3. Select "FastAPI" as the SDK
4. Set the environment variables in Space settings
5. The Space will automatically deploy

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Environment Variables

- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `GITHUB_USERNAME`: GitHub username for fetching repositories
- `SECRET_KEY`: JWT secret key (must be set in production)
- `DATABASE_URL`: Database connection string

## Development

To run in development mode:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

