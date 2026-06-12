# 🩸 Emergency Blood Connector

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)](https://cloud.mongodb.com)

A full-stack MERN web application that connects blood donors with patients and hospitals during medical emergencies. Built as an individual capstone project.

> **Live Demo:** `https://emergency-blood-connector-three.vercel.app`  
> **Backend API:** `https://emergency-blood-connector-cg8f.onrender.com`

---

## What It Does

The platform connects three types of users:

| Role | Capabilities |
|------|-------------|
| 🩸 **Donor** | Register with blood group & city, manage availability, view emergency requests |
| 🏥 **Receiver** | Post emergency blood requests, search donors by blood group & city |
| 🛡️ **Admin** | Manage all users (activate/deactivate), delete requests, view platform statistics |

### Key Features
- 🔐 **JWT authentication** via HTTP-only cookies (XSS-safe — token never touches JS)
- 🩸 **Donor search** by blood group + city (case-insensitive partial match)
- 🚨 **Emergency requests** sorted by urgency (critical → urgent → normal)
- ⏰ **90-day eligibility rule** — donors shown as ineligible within 90 days of last donation
- 📱 **Fully responsive** — mobile-first design with hamburger navigation
- 🔄 **Auto-refresh** — emergency requests refresh every 30 seconds
- 🛡️ **Security hardened** — Helmet headers, rate limiting, MongoDB injection sanitization

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| State | Zustand |
| Forms | React Hook Form |
| Routing | React Router v7 |
| HTTP Client | Axios (with JWT cookie support) |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Auth | JWT in HTTP-only cookies |
| Password | bcryptjs (12 salt rounds) |
| Security | Helmet, express-rate-limit |

---

## Project Structure

```
emergency_blood_connector/
├── .gitignore
├── backend/
│   ├── .env.example          ← Environment variable template
│   ├── server.js             ← Express app entry point
│   ├── middleware/
│   │   └── verifyToken.js    ← JWT auth + RBAC middleware
│   ├── models/
│   │   ├── UserModel.js      ← Mongoose user schema
│   │   └── RequestModel.js   ← Mongoose blood request schema
│   └── routes/
│       ├── authRoutes.js     ← /api/auth/* (register, login, logout, check-auth)
│       ├── donorRoutes.js    ← /api/donors/* (list, profile update)
│       ├── requestRoutes.js  ← /api/requests/* (CRUD)
│       └── adminRoutes.js    ← /api/admin/* (stats, user & request management)
└── frontend/
    ├── .env.example          ← Frontend env template
    ├── vite.config.js        ← Vite + dev proxy config
    └── src/
        ├── main.jsx          ← React entry point
        ├── App.jsx           ← Router & route definitions
        ├── index.css         ← Global styles + design tokens
        ├── api/
        │   └── axiosInstance.js  ← Axios with credentials + 401 interceptor
        ├── store/
        │   └── authStore.js      ← Zustand global auth state
        ├── components/
        │   ├── RootLayout.jsx    ← App shell (Navbar + Footer + checkAuth)
        │   ├── Navbar.jsx        ← Responsive navigation
        │   ├── Footer.jsx        ← Site footer
        │   └── ProtectedRoute.jsx ← Auth + role-based route guard
        └── pages/
            ├── Home.jsx              ← Landing page
            ├── Login.jsx             ← Login form
            ├── Register.jsx          ← Registration (Donor / Receiver)
            ├── Dashboard.jsx         ← Role-specific dashboard
            ├── DonorList.jsx         ← Search & filter donors
            ├── EmergencyRequests.jsx ← Active SOS requests (auto-refresh)
            ├── CreateRequest.jsx     ← Post blood request (Receiver)
            ├── Profile.jsx           ← Donor profile editor
            ├── AdminDashboard.jsx    ← Admin control panel
            └── Unauthorized.jsx      ← 403 access denied page
```

---

## Local Setup

### Prerequisites
- **Node.js 18+**
- **MongoDB Atlas** account (free tier works)
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/vamshikrishna-kommu/emergency-blood-connector.git
cd emergency-blood-connector
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
DB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bloodconnector
SECRET_KEY=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
PORT=4000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm install
npm run dev   # starts at http://localhost:4000
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev   # starts at http://localhost:5173
```

> **Dev note:** The Vite proxy forwards all `/api/*` requests from port 5173 → 4000 automatically. No extra configuration needed.

### 4. Create an Admin account

1. Register any account through the app
2. Go to MongoDB Atlas → **Collections** → `bloodconnector.users`
3. Find your document and change `"role": "DONOR"` → `"role": "ADMIN"`
4. Log out and log back in — you now have admin access

---

## Deployment

The application is deployed manually using the following setup:

- **Database:** MongoDB Atlas (M0 Free Tier)
- **Backend:** Deployed manually on [Render](https://render.com) using the `backend` root directory.
- **Frontend:** Deployed manually on [Vercel](https://vercel.com) using the Vite framework preset and `frontend` root directory.

*Note: Environment variables (`FRONTEND_URL`, `DB_URL`, `SECRET_KEY`, `VITE_API_URL`) must be configured securely on the respective deployment platforms.*

---

## API Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|:------------:|-------------|
| `POST` | `/api/auth/register` | Public | Create DONOR or RECEIVER account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT cookie |
| `GET` | `/api/auth/logout` | Public | Clear JWT cookie |
| `GET` | `/api/auth/check-auth` | Any | Verify session, return fresh user data |
| `GET` | `/api/donors` | Any | List active donors (`?bloodGroup=A+&city=Hyd`) |
| `PATCH` | `/api/donors/profile` | DONOR | Update own profile |
| `GET` | `/api/requests` | Any | List open blood requests |
| `POST` | `/api/requests` | RECEIVER, ADMIN | Create emergency blood request |
| `PATCH` | `/api/requests/:id` | Owner, ADMIN | Update request status |
| `DELETE` | `/api/requests/:id` | Owner, ADMIN | Delete request |
| `GET` | `/api/admin/stats` | ADMIN | Platform statistics |
| `GET` | `/api/admin/users` | ADMIN | All non-admin users |
| `PATCH` | `/api/admin/users/:id/status` | ADMIN | Activate / deactivate user |
| `GET` | `/api/admin/requests` | ADMIN | All requests (all statuses) |
| `DELETE` | `/api/admin/requests/:id` | ADMIN | Force-delete any request |

---

## Security Design

| Feature | Implementation |
|---------|---------------|
| XSS Protection | JWT stored in **HTTP-only cookie** — inaccessible to JavaScript |
| Password Storage | **bcrypt** with 12 salt rounds |
| Brute Force | **express-rate-limit** — 15 requests per 15 minutes on auth routes |
| HTTP Headers | **Helmet** — sets X-Frame-Options, CSP, HSTS, and more |
| RBAC | Role checks enforced on **both** frontend (route guards) and backend (middleware) |
| Ownership | Receivers can only edit/delete **their own** requests |
| Input Validation | Server-side email regex, date validation, bcrypt hash verification |
| Production Cookies | `secure: true`, `sameSite: "none"` when `NODE_ENV=production` |

---

## Screenshots

> *(Add screenshots here after deploying)*

| Page | Description |
|------|-------------|
| Home | Landing page with hero and "How It Works" |
| Dashboard | Role-specific overview with recent requests |
| Donor List | Filterable donor cards with eligibility status |
| Emergency Requests | Active SOS cards sorted by urgency |
| Admin Panel | User management + platform statistics |

---

*Built with ❤️ for the Emergency Blood Connector capstone project — 2026*
