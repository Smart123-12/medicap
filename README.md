# 🏥 MediCap — Doctor & Patient Management System

> A simple, scalable healthcare management platform for Gujarat and India.

[![Deploy](https://img.shields.io/badge/Google%20Cloud%20Run-Deployed-blue?logo=googlecloud)](https://medicap-536935184140.europe-west1.run.app)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Overview

MediCap is a full-stack web application that helps patients find doctors, book appointments, and manage health records. It provides separate dashboards for **Patients**, **Doctors**, and **Admins** — with role-based access controls, account verification, and a persistent SQLite database.

**Live Demo:** [https://medicap-536935184140.europe-west1.run.app](https://medicap-536935184140.europe-west1.run.app)

---

## ✨ Features

### 👤 Patient Features
- 🔍 Search and filter 12+ doctors by specialty, city, or name
- 📅 Book appointments with preferred date, time, and type
- 📋 View medical records and health history
- 👤 Profile management with personal details
- ✅ Account verification system

### 🩺 Doctor Features  
- 📊 Doctor-specific dashboard with patient stats
- 📅 View and manage patient appointments
- ✔️ Mark appointments as completed
- 📝 Create and manage patient medical records
- 👤 Professional profile management

### 🛡️ Admin Features
- 📊 System-wide statistics (users, appointments, records)
- 👥 User management — verify, activate/deactivate, delete users
- ➕ **Add new doctors** directly to the platform
- ➕ **Add new patients** with pre-verified accounts
- 🔄 Real-time data refresh

### 🔒 Security & Auth
- JWT-based stateless authentication (7-day tokens)
- bcrypt password hashing (10 salt rounds)
- Role-based access control (Patient / Doctor / Admin)
- Helmet.js security headers
- Input validation on all API endpoints

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS SPA, CSS3, Material Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via better-sqlite3) with in-memory fallback |
| **Auth** | JWT + bcryptjs |
| **Security** | Helmet, CORS |
| **Deploy** | Google Cloud Run + Cloud Build |
| **CI/CD** | GitHub → Cloud Build → Cloud Run (auto-deploy) |

---

## 📁 Project Structure

```
medicap/
├── server.js              # Express server + API routes + DB layer
├── package.json           # Dependencies
├── Dockerfile             # Cloud Run container config
├── .gitignore             # Ignored files
├── data/                  # SQLite database (auto-created)
│   └── medicap.db
└── public/                # Frontend SPA
    ├── index.html         # Main HTML
    ├── css/
    │   ├── design-system.css   # Design tokens & variables
    │   ├── components.css      # UI component styles
    │   └── layouts.css         # Page layout styles
    └── js/
        ├── app.js         # Main controller (navigation, auth, admin)
        ├── store.js       # State management + API client
        ├── pages.js       # Page renderers (role-based dashboards)
        ├── components.js  # Reusable UI components
        └── data.js        # Seed data for offline mode
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Smart123-12/medicap.git
cd medicap

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
# Visit http://localhost:8080
```

### Default Admin Login
| Field | Value |
|-------|-------|
| Email | `admin@medicap.com` |
| Password | `admin123` |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| POST | `/api/auth/verify` | Verify account |

### Doctors (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all doctors (with filters) |
| GET | `/api/doctors/:id` | Get doctor details |

### Appointments (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List user's appointments |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |
| PUT | `/api/appointments/:id/complete` | Complete (doctor/admin) |

### Records (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | List user's records |
| POST | `/api/records` | Create record (doctor/admin) |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| PUT | `/api/admin/users/:id/verify` | Verify user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/admin/doctors` | **Add new doctor** |
| PUT | `/api/admin/doctors/:id` | Update doctor |
| DELETE | `/api/admin/doctors/:id` | Remove doctor |
| POST | `/api/admin/patients` | **Add new patient** |
| GET | `/api/admin/stats` | System statistics |

---

## 🗃️ Database

MediCap uses **SQLite** (via `better-sqlite3`) for persistent storage:

- **Users** — All registered users with hashed passwords
- **Doctors** — Doctor directory with specialties, fees, ratings
- **Appointments** — Patient-doctor appointment bookings
- **Records** — Medical records and health history

The database file is stored at `data/medicap.db` and is automatically created on first run. Data persists across server restarts.

> **Cloud Run Note:** Cloud Run containers are ephemeral. For true persistence in production, mount a Cloud Storage bucket or migrate to Cloud SQL / Firestore.

---

## 🌐 Deployment (Google Cloud Run)

The app auto-deploys via Cloud Build whenever code is pushed to `main`:

```bash
# Push changes to trigger deployment
git add .
git commit -m "your message"
git push origin main
```

### Manual Deploy
```bash
gcloud run deploy medicap \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET=your-secret
```

---

## 🏙️ Cities Served

| City | State |
|------|-------|
| Ahmedabad | Gujarat |
| Surat | Gujarat |
| Vadodara | Gujarat |
| Rajkot | Gujarat |
| Gandhinagar | Gujarat |
| Bhavnagar | Gujarat |
| Jamnagar | Gujarat |
| Junagadh | Gujarat |

---

## 👨‍💻 Author

**Smart123-12** — [GitHub](https://github.com/Smart123-12)

---

## 📄 License

This project is licensed under the MIT License.
