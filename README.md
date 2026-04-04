# 🏥 MediCap — Doctor & Patient Management System

> A modern, scalable healthcare management platform for Gujarat and India.  
> Built with Node.js + Express | Deployed on Google Cloud Run

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20+-blue)
![Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run-4285F4)

## 🚀 Features

- **🔐 JWT Authentication** — Secure login/register with bcrypt password hashing
- **👨‍⚕️ Find Doctors** — Browse 12+ doctors across 8 Gujarat cities, 12 specialties
- **📅 Appointment Booking** — Select date, time slot, and confirm instantly
- **📋 Medical Records** — View visit history, vitals, prescriptions, lab tests
- **📊 Dashboard** — Stats, quick actions, and activity feed
- **🌓 Dark/Light Theme** — Persisted toggle with smooth transition
- **📱 Fully Responsive** — Desktop, tablet, and mobile
- **☁️ Cloud Ready** — Dockerized for Google Cloud Run

## 📁 Project Structure

```
medicap/
├── server.js               # Express API server (auth, doctors, appointments, records)
├── package.json
├── Dockerfile              # Cloud Run container
├── .env.example            # Environment variables template
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline → Cloud Run
└── public/                 # Frontend (served as static files)
    ├── index.html
    ├── css/
    │   ├── index.css       # Design system & tokens
    │   ├── components.css  # Reusable components
    │   ├── pages.css       # Page-specific styles
    │   └── responsive.css  # Breakpoints
    └── js/
        ├── data.js         # Seed data & constants
        ├── store.js        # State management + API client
        ├── components.js   # UI renderers
        ├── pages.js        # Page templates
        └── app.js          # Main controller
```

## 🛠️ Local Development

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Setup
```bash
# Clone
git clone https://github.com/YOUR_USERNAME/medicap.git
cd medicap

# Install dependencies
npm install

# Create env file
cp .env.example .env

# Start server
npm start
```

Open **http://localhost:8080** in your browser.

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create new account |
| POST | `/api/auth/login` | ❌ | Login & get JWT token |
| GET | `/api/auth/me` | ✅ | Verify session |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/password` | ✅ | Change password |
| GET | `/api/doctors` | ❌ | List/search doctors |
| GET | `/api/doctors/:id` | ❌ | Doctor detail |
| GET | `/api/appointments` | ✅ | User's appointments |
| POST | `/api/appointments` | ✅ | Book appointment |
| PUT | `/api/appointments/:id/cancel` | ✅ | Cancel appointment |
| GET | `/api/records` | ✅ | Medical records |
| POST | `/api/records` | ✅ (Doctor) | Create record |
| GET | `/api/health` | ❌ | Health check |

## ☁️ Deploy to Google Cloud Run

### Option 1: GitHub Actions (Automated)

1. **Set up GitHub Secrets** in Settings → Secrets:
   - `GCP_PROJECT_ID` — Your GCP project ID
   - `GCP_SA_KEY` — Service account JSON key
   - `JWT_SECRET` — A strong random JWT secret

2. **Push to main** — deployment triggers automatically:
   ```bash
   git add .
   git commit -m "Deploy MediCap"
   git push origin main
   ```

### Option 2: Manual Deploy with gcloud

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy medicap \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --set-env-vars "NODE_ENV=production,JWT_SECRET=your-secret-key"
```

## 🔐 Authentication Flow

```
Register → bcrypt hash password → Store user → Generate JWT → Return token
Login    → Find user → bcrypt compare → Generate JWT → Return token
API Call → Extract Bearer token → jwt.verify() → Attach user to request
```

## 📍 Coverage

**8 Gujarat Cities:** Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Bhavnagar, Junagadh, Anand

**12 Specialties:** General Medicine, Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, Gynecology, ENT, Ophthalmology, Psychiatry, Dentistry, Urology

## 📜 License

MIT © MediCap Team
