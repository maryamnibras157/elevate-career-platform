# ELEVATE

**The AI Operating System for Student Careers**

ELEVATE is a production-ready, enterprise-grade AI-powered SaaS platform that helps students discover careers, analyze resumes, identify skill gaps, generate career roadmaps, and improve placement readiness through explainable AI.

---

## Features

- **Resume Analyzer**: PDF/DOCX parsing with AI-driven ATS scoring, keyword extraction, and personalized feedback.
- **Career Discovery Engine**: AI-powered career recommendations matching user skills to market demand.
- **Skill Gap Analyzer**: Analyzes the difference between a student's profile and target job descriptions.
- **Career Roadmap Generator**: AI-generated step-by-step milestones to achieve career goals.
- **AI Career Mentor**: An interactive AI chat assistant providing career guidance.
- **Mock Interviews**: Dynamic AI-generated technical and behavioral interviews with instant feedback and scoring.
- **Admin Dashboard**: Comprehensive administration suite including User Management, Career Management, System Settings, Audit Logs, and Analytics.
- **Reports & Notifications**: Automated scheduled reporting and dynamic in-app/email notifications, powered by a robust concurrent database scheduler.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui |
| State | Zustand, React Query, React Hook Form, Zod |
| Backend | FastAPI, Python, SQLAlchemy (async), Alembic, Pydantic |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT, Refresh Tokens, Google OAuth |
| Infrastructure | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (Recommended)

---

### Option 1: Docker Compose (Recommended)

The easiest way to run the entire stack for production or testing.

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd CRS

# 2. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Edit the .env files with your secrets (see Environment Variables section)

# 4. Start all services
docker-compose up -d

# 5. Run database migrations
docker-compose exec backend alembic upgrade head
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs

---

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
# Activate (Windows): venv\Scripts\activate
# Activate (macOS/Linux): source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `DATABASE_URL_SYNC` | PostgreSQL sync URL (`postgresql://...`) |
| `REDIS_URL` | Redis connection URL |
| `CORS_ORIGINS` | Comma-separated list of allowed origins |
| `GEMINI_API_KEY` | API Key for Gemini AI integrations |
| `MAIL_USERNAME` | SMTP username for sending notifications |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## Database Architecture & Migrations

The system uses an asynchronous SQLAlchemy engine.
Key models include: `User`, `Session`, `AuditLog`, `ResumeAnalysis`, `Career`, `Skill`, `ReportConfig`, `Notification`.

```bash
# Run all pending migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"
```

---

## Security & Concurrency Hardening

- **Authentication**: Passwords hashed with bcrypt; JWT access and refresh tokens used securely.
- **Authorization**: Role-based Access Control (RBAC) preventing privilege escalation.
- **Scheduler Resilience**: Background tasks (Notifications, Reports) use PostgreSQL row-level locks (`SELECT ... FOR UPDATE SKIP LOCKED`) to ensure no duplicate executions across multi-worker or multi-container deployments.
- **Audit Logging**: Immutable audit logs for all administrative actions and sensitive user events.
- **SQL Injection**: Prevented via SQLAlchemy ORM abstractions.
- **Database Performance**: Fully indexed across heavily queried fields (`created_at`, `is_verified`, `status`, etc.).

---

## Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
uvicorn main:app --reload          # Development server
uvicorn main:app --workers 4       # Production (multi-worker)
alembic upgrade head               # Run migrations
```

---

## License

MIT License — see LICENSE file for details.

Built with care. Designed for students.
