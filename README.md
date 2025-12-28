# 🚀 CRM Pro - Enterprise Customer Relationship Management

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)

**A modern, full-stack CRM solution built for enterprise teams**

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📊 Dashboard & Analytics
- **Real-time metrics** - Track leads, customers, deals, and revenue at a glance
- **Interactive charts** - Visualize data with Recharts (leads overview, deal pipeline, revenue trends)
- **Sales performance** - Monitor team and individual metrics

### 👥 Lead Management
- Full CRUD operations for leads
- Status tracking (New, Contacted, Qualified, Lost)
- Lead-to-customer conversion workflow

### 🤝 Customer Management
- Comprehensive customer profiles
- Activity history and notes
- Company association

### 💼 Deal Pipeline
- Multi-stage deal tracking (Prospecting → Closed Won/Lost)
- Deal value and probability tracking
- Expected close date management

### ✅ Task Management
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Cancelled)
- Assignment to team members

### 📈 Reports & Analytics
- Date range filtering
- User and team filters
- Export capabilities (PDF/CSV)

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Manager, Sales)
- Secure route protection via middleware

### 🎨 Premium UI/UX
- **Dark/Light mode** with persistent theme
- **Glassmorphism effects** and gradients
- **Responsive design** for all devices
- **Smooth animations** and micro-interactions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **PostgreSQL** 14.x (or SQLite for development)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Production Build

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend (use gunicorn for production)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety and developer experience |
| **Tailwind CSS 4** | Utility-first styling |
| **ShadCN UI** | Premium component library |
| **React Query** | Server state management |
| **Recharts** | Data visualization |
| **next-themes** | Dark/Light mode support |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python API framework |
| **SQLAlchemy** | ORM for database operations |
| **Pydantic** | Data validation and serialization |
| **Alembic** | Database migrations |
| **JWT** | Authentication tokens |
| **PostgreSQL** | Production database |

---

## 📁 Project Structure

```
CRM/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── v1/         # API version 1
│   │   ├── core/           # Core configurations
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry
│   ├── alembic/            # Database migrations
│   └── requirements.txt
│
└── frontend/               # Next.js Frontend
    ├── src/
    │   ├── app/            # App Router pages
    │   │   ├── (auth)/     # Auth pages (login, register)
    │   │   └── (dashboard)/ # Dashboard pages
    │   ├── components/     # React components
    │   │   ├── charts/     # Chart components
    │   │   ├── providers/  # Context providers
    │   │   ├── shared/     # Shared components
    │   │   └── ui/         # ShadCN UI components
    │   ├── context/        # React contexts
    │   ├── hooks/          # Custom hooks (React Query)
    │   ├── layouts/        # Layout components
    │   ├── services/       # API service layer
    │   └── types/          # TypeScript types
    └── package.json
```

---

## 📚 API Documentation

Once the backend is running, access the interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User authentication |
| POST | `/api/v1/auth/register` | User registration |
| GET | `/api/v1/leads` | List all leads |
| POST | `/api/v1/leads` | Create a new lead |
| GET | `/api/v1/customers` | List all customers |
| GET | `/api/v1/deals` | List all deals |
| GET | `/api/v1/tasks` | List all tasks |
| GET | `/api/v1/analytics` | Get analytics data |

---

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/crm_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🎨 Theme Customization

The application supports extensive theming via CSS variables. Edit `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0);
  --background: oklch(1 0 0);
  /* ... other variables */
}

.dark {
  --primary: oklch(0.922 0 0);
  --background: oklch(0.145 0 0);
  /* ... dark mode variables */
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) for the beautiful component library
- [Recharts](https://recharts.org/) for data visualization
- [FastAPI](https://fastapi.tiangolo.com/) for the amazing Python framework
- [Next.js](https://nextjs.org/) for the React framework

---

<div align="center">

**Built with ❤️ for modern enterprises**

[⬆ Back to top](#-crm-pro---enterprise-customer-relationship-management)

</div>