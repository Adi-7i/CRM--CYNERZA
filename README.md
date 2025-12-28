# Enterprise CRM Backend

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready **Customer Relationship Management (CRM)** system built with **FastAPI**, designed for enterprise use with scalability, security, and performance in mind.

## 🌟 Features

### Core Modules
- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (RBAC: Admin, Manager, Sales)
  - Secure password hashing with bcrypt

- **👥 Lead Management**
  - Lead tracking and qualification
  - Source and status tracking
  - Lead notes and activity history
  - Lead-to-customer conversion

- **🤝 Customer Management**
  - Customer profiles with complete history
  - Interaction tracking (calls, emails, meetings)
  - Lead conversion workflow
  - Customer notes and activities

- **💼 Deal/Opportunity Management**
  - Sales pipeline management
  - Stage tracking (Prospecting → Closed Won/Lost)
  - Deal value and probability tracking
  - Pipeline view for Kanban boards

- **✅ Task & Follow-Up Management**
  - Task assignment and tracking
  - Priority and status management
  - Entity relationships (tasks linked to leads/customers/deals)
  - Automatic overdue detection

- **📊 Analytics & Dashboard**
  - Real-time business metrics
  - Lead source analysis and conversion rates
  - Deal pipeline analytics
  - Sales performance tracking
  - Chart-ready JSON responses

### Production Features
- **🛡️ Centralized Error Handling**: Custom exceptions with standardized responses
- **📝 Structured Logging**: JSON logs for production, colored output for development
- **🔍 Request Tracking**: Unique request IDs and response time monitoring
- **✅ Input Validation**: Comprehensive validation and sanitization
- **🏥 Health Checks**: Kubernetes-ready liveness and readiness probes
- **📖 API Documentation**: Auto-generated OpenAPI (Swagger) docs

## 🚀 Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- **Authentication**: JWT tokens with [python-jose](https://github.com/mpdavis/python-jose)
- **Password Hashing**: [passlib](https://passlib.readthedocs.io/) with bcrypt
- **Validation**: [Pydantic](https://docs.pydantic.dev/) - Data validation
- **Database**: SQLite (development) / PostgreSQL (production ready)

## 📁 Project Structure

```
CRM/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/        # API route handlers
│   │           ├── auth.py       # Authentication endpoints
│   │           ├── users.py      # User management
│   │           ├── leads.py      # Lead management
│   │           ├── customers.py  # Customer management
│   │           ├── deals.py      # Deal/Opportunity management
│   │           ├── tasks.py      # Task management
│   │           ├── analytics.py  # Analytics & dashboard
│   │           └── health.py     # Health checks
│   ├── core/
│   │   ├── config.py            # Application configuration
│   │   ├── database.py          # Database connection
│   │   ├── security.py          # Security utilities
│   │   ├── permissions.py       # RBAC permissions
│   │   ├── exceptions.py        # Custom exceptions
│   │   ├── error_handlers.py    # Global error handlers
│   │   ├── logging_config.py    # Logging configuration
│   │   └── validators.py        # Input validators
│   ├── crud/                    # Database operations
│   ├── middleware/              # Custom middleware
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   ├── services/                # Business logic layer
│   └── main.py                  # Application entry point
├── alembic/                     # Database migrations
├── logs/                        # Application logs (production)
├── .env                         # Environment variables
├── .env.example                 # Example environment file
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🔧 Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your settings
   # Set SECRET_KEY, DATABASE_URL, etc.
   ```

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Create initial admin user** (optional)
   ```python
   python scripts/create_admin.py
   ```

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# Application
PROJECT_NAME=Enterprise CRM
VERSION=1.0.0
ENVIRONMENT=development  # development, staging, production
DEBUG=true
LOG_LEVEL=INFO

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=sqlite:///./crm.db
# For PostgreSQL: postgresql://user:password@localhost:5432/crm_db

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 🏃 Running the Application

### Development Mode
```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

### Production Mode
```bash
# Set environment to production in .env
ENVIRONMENT=production
DEBUG=false

# Run with production settings
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

### Authentication

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@crm.com",
  "password": "Admin@12345"
}
```

**Response**
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

### Using Authentication
Include the JWT token in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

### Key Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | `POST /api/v1/auth/login` | User login |
| **Auth** | `POST /api/v1/auth/refresh` | Refresh token |
| **Users** | `GET /api/v1/users` | List users (Admin) |
| **Leads** | `GET /api/v1/leads` | List leads |
| **Leads** | `POST /api/v1/leads` | Create lead |
| **Customers** | `POST /api/v1/customers/convert-lead` | Convert lead to customer |
| **Deals** | `GET /api/v1/deals/pipeline` | Pipeline view (Kanban) |
| **Tasks** | `GET /api/v1/tasks` | List tasks |
| **Analytics** | `GET /api/v1/analytics/dashboard` | Dashboard overview |
| **Health** | `GET /api/v1/health` | Health check |

For complete API documentation, visit `/docs` when running the application.

## 🔐 Role-Based Access Control (RBAC)

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | System administrator | Full access to all resources |
| **Manager** | Team manager | View all, manage team resources |
| **Sales** | Sales representative | View and manage only assigned records |

### Permission Matrix

| Resource | Admin | Manager | Sales |
|----------|-------|---------|-------|
| Users | CRUD | Read | - |
| All Leads | CRUD | CRUD | Read (assigned only) |
| All Customers | CRUD | CRUD | Read (assigned only) |
| All Deals | CRUD | CRUD | Read (owned only) |
| All Tasks | CRUD | CRUD | Read (assigned only) |
| Analytics | All data | All data | Own data only |

## 🗄️ Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

### View migration history
```bash
alembic history
```

## 🏥 Health Checks

The application provides multiple health endpoints for monitoring:

**Liveness Probe** (Kubernetes)
```http
GET /api/v1/health/live
```

**Readiness Probe** (Database connectivity)
```http
GET /api/v1/health/ready
```

**Full Health Status**
```http
GET /api/v1/health
```

**Response Example**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-28T13:48:29Z",
  "version": "1.0.0",
  "environment": "development",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 2.28
    }
  }
}
```

## 🧪 Testing

### Run all tests
```bash
pytest
```

### Test with coverage
```bash
pytest --cov=app --cov-report=html
```

### Test specific module
```bash
pytest tests/test_leads.py -v
```

## 📊 Logging

### Development
Colored console output with readable formatting

### Production
Structured JSON logs for log aggregators (ELK, CloudWatch, etc.)

**Log Fields**:
- `timestamp`: ISO 8601 timestamp
- `level`: Log level (DEBUG, INFO, WARNING, ERROR)
- `message`: Log message
- `request_id`: Unique request ID
- `user_id`: User performing action (if applicable)
- `action`: Action performed
- `duration_ms`: Request duration

**Log Files** (Production):
- `logs/crm.log`: All application logs

## 🚀 Production Deployment

### Using Docker

```dockerfile
# Dockerfile example
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t crm-backend .
docker run -p 8000:8000 --env-file .env crm-backend
```

### Environment Variables for Production

```env
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:pass@db:5432/crm
```

### Recommendations
- Use PostgreSQL or MySQL in production (not SQLite)
- Set strong `SECRET_KEY` (use secrets generator)
- Enable HTTPS/TLS
- Configure reverse proxy (nginx, Traefik)
- Set up log rotation
- Configure monitoring and alerting
- Use container orchestration (Kubernetes, Docker Swarm)

## 📈 Performance Optimization

- **Database Indexes**: Applied on frequently queried fields
- **Connection Pooling**: SQLAlchemy connection pool configured
- **Query Optimization**: Efficient aggregations, minimal N+1 queries
- **Pagination**: All list endpoints have pagination
- **Caching**: Response caching ready (Redis integration possible)

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS prevention (input sanitization)
- ✅ CORS configuration
- ✅ Rate limiting ready
- ✅ Request validation
- ✅ Sensitive data excluded from logs in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- FastAPI for the excellent framework
- SQLAlchemy for powerful ORM
- The open-source community

## 📞 Support

For support, email hello@cynerza.com or open an issue in the repository.

---

**Made with ❤️ for enterprise CRM needs**