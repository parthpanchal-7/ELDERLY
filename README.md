# 🏡 SaathiCare — "Care that feels close to home."

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-forestgreen.svg)](https://www.mongodb.com/atlas)
[![Accessibility](https://img.shields.io/badge/WCAG-2.2%20AA%20Compliant-147D75.svg)](#accessibility--inclusive-design)

> **SaathiCare** is a smart interconnected healthcare management platform engineered specifically for older adults, their families, and caregivers. It goes beyond basic reminder apps by delivering an interconnected **Care Assurance Loop**, proactive **Email/SMS/Push notifications**, privacy-first **passcode authorization**, and **refill tracking** — all while ensuring the older adult retains sovereign control over their health decisions.

---

## 📑 Table of Contents
1. [Problem Statement & Solution](#-problem-statement--solution)
2. [Six Core Innovations](#-six-core-innovations)
3. [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
4. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
5. [The Care Assurance Lifecycle](#-the-care-assurance-lifecycle)
6. [Design System & Accessibility](#-design-system--accessibility)
7. [Environment Variables Guide](#-environment-variables-guide)
8. [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
9. [Pre-Seeded Demo Accounts (Evaluator Guide)](#-pre-seeded-demo-accounts-evaluator-guide)
10. [API Reference & OpenAPI Mapping](#-api-reference)
11. [Deployment Guide (Serverless + Container)](#-deployment-guide)
12. [LinkedIn Announcement Post](#-linkedin-post-draft)

---

## 🎯 Problem Statement & Solution

### The Challenge
- **Siloed Care:** Older adults often take multiple daily medications across distinct times and conditions. When doses are missed, family members living afar are left in the dark until a health crisis occurs.
- **Patronizing & Complex UI:** Standard apps feature tiny icons, confusing navigation, and low contrast that frustrate seniors.
- **Privacy & Security Risks:** Existing reminder tools either share health records publicly or silently strip older adults of autonomy.

### The SaathiCare Solution
- **Tri-Role Collaboration:** Three tailored interfaces for **Older Adults (Profile Owners)**, **Family Members**, and **Professional Caregivers**.
- **Care Assurance Loop:** `Schedule → Remind → Confirm → Escalate → Respond`. Doses unconfirmed past 30 minutes trigger proactive alerts to family.
- **Passcode-Authorized Circles:** Access requires both an authenticated account AND a short-lived, bcrypt-hashed 6-digit passcode.
- **Dignified Accessibility:** Atkinson Hyperlegible bold italic typography, minimum 48px touch targets, Web Speech API audio readout, and Hindi/English localization.

---

## 💡 Six Core Innovations

```
   ┌──────────────────────────────────────────────────────────────┐
   │                  THE CARE ASSURANCE LOOP                     │
   └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
      [ 1. Schedule ]  ──►  [ 2. Due Reminder ]
                                  │
                         Is dose confirmed?
                             /          \
                           YES           NO (Grace >30m)
                           /              \
                          ▼                ▼
                  [ Marked Taken ]    [ 3. Care Circle Escalation ]
                  (Inventory -1)      (Email, Push & In-App Alert)
                                           │
                                           ▼
                                    [ 4. Family Check-in ]
```

1. **The Care Assurance Loop:** Real-time dose status tracking (`scheduled`, `due`, `taken`, `skipped`, `snoozed`, `unconfirmed`). Unconfirmed doses escalate to authorized family automatically.
2. **One-Time Passcode Circle:** Family access is granted through ephemeral passcodes that expire in 24 hours, lock after 5 attempts, and can be revoked with 1 click.
3. **Smart Refill Watch:** Automatically decrements on-hand supplies upon confirmed ingestion and warns families before medication inventories run out.
4. **Accessibility Companion:** 48px+ touch targets, high contrast toggle, dynamic font sizing (`normal`, `large`, `xlarge`), and browser speech synthesis for audio readout.
5. **Doctor Appointments & RFC 5545 .ics:** Coordinates clinic locations, clinician details, and 1-click calendar sync.
6. **Cryptographic Audit Provenance:** Immutable audit trail logging actor ID, timestamp, IP address, and change payload for every critical healthcare event.

---

## 🏗️ Architecture & Monorepo Structure

```
elderly/
├── package.json              # Workspace root (npm workspaces)
├── .env.example              # Centralized environment reference
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Accessible design system (Button, Card, Badge, Modal, Input)
│   │   │   ├── layout/       # Navbar, DashboardLayout with Audio Readout
│   │   │   └── shared/       # ProtectedRoute, RoleGuard, NotificationBell
│   │   ├── contexts/         # AuthContext, ThemeContext (Text size, Contrast, TTS)
│   │   ├── pages/
│   │   │   ├── public/       # LandingPage, LoginPage, SignupPage, PrivacyPage
│   │   │   ├── onboarding/   # RoleSelection, CreateProfile, InviteCareCircle, VerifyPasscode
│   │   │   ├── elderly/      # TodayDashboard, MedicationsPage, AppointmentsPage, CareCircle
│   │   │   ├── family/       # FamilyDashboard, AdherencePage (Recharts), AlertsPage
│   │   │   └── caregiver/    # CaregiverDashboard, TaskQueuePage, AuditPage
│   │   └── lib/              # Axios instance with auth interceptors
└── backend/                  # Node.js + Express + TypeScript + Mongoose
    ├── api/                  # Vercel Serverless entrypoint (index.ts)
    └── src/
        ├── config/           # Database cache & environment validator
        ├── models/           # 19 Mongoose Schemas (User, CareProfile, Dose, etc.)
        ├── middleware/       # JWT auth, Role guards, IDOR profile access guards
        ├── routes/           # REST endpoints (/auth, /profiles, /doses, /medications)
        ├── services/         # Adherence calculations & Care Circle operations
        ├── utils/            # Crypto, Resend email templates, RFC 5545 ics generator
        └── scripts/          # Synthetic demo database seeder
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Resource / Capability | Profile Owner (Elderly) | Family Member | Professional Caregiver | Public / Unauth |
|---|:---:|:---:|:---:|:---:|
| **Profile Core Details** | Full CRUD | Read-Only | Read-Only | Denied |
| **Medication Schedules** | Full CRUD | Read-Only | Read & Propose | Denied |
| **Mark Dose as Taken** | Full Access | Optional Proxy | Full Access | Denied |
| **Passcode Invitations** | Generate & Revoke | View Status | View Status | Denied |
| **Escalation Alerts** | Recipient | Recipient | Recipient | Denied |
| **Adherence Analytics** | Full Access | Full Access | Full Access | Denied |
| **Data Export (JSON)** | Full Access | Denied (unless permitted)| Denied | Denied |

---

## 🎨 Design System & Accessibility

* **Deep Navy (`#193C47`)**: Represents calm, dignified authority.
* **Care Teal (`#147D75`)**: Primary action color, chosen for optimal contrast.
* **Soft Mint (`#E6F5EF`)**: Soft soothing background for cards and badges.
* **Warm Canvas (`#F9F7F1`)**: Warm background preventing glare and visual fatigue.
* **Warm Accent (`#D56A39`)**: Used for alerts, overdue warnings, and emergencies.
* **Typography:** Atkinson Hyperlegible font with **bold italic headings** ensuring optimal letterform distinction for low-vision individuals.
* **Controls:** 48px to 64px touch targets throughout to accommodate tremors or reduced motor control.

---

## ⚙️ Environment Variables Guide

Copy `.env.example` to `.env` in the root:

| Variable | Required? | Description | Default / Example |
|---|:---:|---|---|
| `MONGODB_URI` | **Yes** | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | **Yes** | Secret for signing access tokens | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for refresh token rotation | `openssl rand -hex 32` |
| `PORT` | No | Express listening port | `5000` |
| `CLIENT_URL` | No | Frontend URL for CORS allowlist | `http://localhost:5173` |
| `RESEND_API_KEY` | Optional | Resend API key for real emails | `re_123456789...` *(falls back to console sink if empty)* |
| `EMAIL_FROM` | Optional | Outgoing notification sender | `SaathiCare <care@saathicare.com>` |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio SID for SMS notifications | `ACxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio Token | `your_auth_token` |
| `VAPID_PUBLIC_KEY` | Optional | Web push notification public key | `Bxxxxxxxx...` |
| `VAPID_PRIVATE_KEY` | Optional | Web push notification private key | `xxxxxxxx...` |

---

## 🚀 Quick Start & Setup Instructions

### 1. Prerequisites
- Node.js v18+ (tested on v20 and v22)
- MongoDB instance (MongoDB Atlas free tier or local `mongodb://localhost:27017`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/saathicare.git
cd saathicare

# Install monorepo dependencies
npm install
```

### 3. Run Locally
```bash
# Start backend (port 5000) and frontend (port 5173) simultaneously
npm run dev
```
Open **`http://localhost:5173`** in your browser! Register your clean user account to get started.

To clear or reset any data at any time:
```bash
npm run seed --workspace=backend  # Runs the database cleaner
```

---

## 👤 Account Creation & Roles

Create an account by registering on the signup screen:

| Role | Intended User | Capabilities |
|---|---|---|
| **Elderly Owner** | Older Adult managing health | Schedule medications, confirm/snooze/skip doses, manage care circle invitations & passcodes, view audio readout |
| **Family Member** | Daughter, Son, Relative | View permitted adherence trends (Recharts), receive unconfirmed dose escalation notifications, monitor refill thresholds |
| **Caregiver** | Nurse or Professional Aide | Administer scheduled doses, log vital signs (blood pressure, blood glucose), maintain audit records |

---

## 📡 API Reference

SaathiCare provides over 40 structured REST endpoints with uniform JSON responses:

* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/google`, `POST /api/auth/logout`
* **Profiles:** `GET /api/profiles`, `POST /api/profiles`, `GET /api/profiles/:id`, `GET /api/profiles/:id/export`
* **Care Circles:** `GET /api/care-circles/:id/members`, `POST /api/care-circles/:id/invitations`, `POST /api/care-circles/invitations/verify-accept`, `DELETE /api/care-circles/:id/members/:memberId`
* **Medications:** `GET /api/medications/:profileId/medications`, `POST /api/medications/:profileId/medications`, `DELETE /api/medications/detail/:id`
* **Doses:** `GET /api/doses/:profileId/doses`, `POST /api/doses/:id/confirm`, `POST /api/doses/:id/skip`, `POST /api/doses/:id/snooze`, `POST /api/doses/:profileId/doses/escalation-check`
* **Appointments:** `GET /api/appointments/:profileId/appointments`, `POST /api/appointments/:profileId/appointments`, `GET /api/appointments/detail/:id/ics`
* **Routines:** `GET /api/routines/:profileId/routines`, `POST /api/routines/complete/:id`
* **Observations:** `GET /api/observations/:profileId/observations`, `POST /api/observations/:profileId/observations`
* **Notifications:** `GET /api/notifications/:profileId/notifications`, `POST /api/notifications/test`
* **Analytics:** `GET /api/analytics/:profileId/analytics/adherence`, `GET /api/analytics/:profileId/analytics/refill-watch`

---

## ☁️ Deployment Guide

### Frontend Deployment (Vercel)
1. Push repo to GitHub.
2. In Vercel, import repo with Root Directory set to `frontend`.
3. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
4. Deploy!

### Backend Serverless Deployment (Vercel)
The backend includes `backend/api/index.ts` allowing direct serverless hosting on Vercel:
```json
{
  "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

### Backend Container Deployment (Render / Railway)
1. In Render or Railway, create a Web Service pointing to `backend/`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Supply your `MONGODB_URI` and `JWT_SECRET`.

---

## 📢 LinkedIn Post Draft

```
🚀 Proud to announce SaathiCare — "Care that feels close to home."

Managing chronic conditions and daily medications shouldn't feel lonely or overwhelming for older adults, nor should it create constant anxiety for their loved ones.

That's why I built SaathiCare for the hackathon: an interconnected healthcare management platform engineered around dignity, simplicity, and proactive care assurance.

💡 Key Highlights:
1️⃣ The Care Assurance Loop: Schedule → Remind → Confirm → Escalate. Overdue doses automatically notify the care circle after a 30-minute grace period.
2️⃣ Ephemeral Passcode Authorization: Family members join using secure, 6-digit bcrypt-hashed passcodes with zero silent record access.
3️⃣ Accessible Design: Atkinson Hyperlegible bold italic typography, 48px+ touch targets, browser voice readout, and English/Hindi support.
4️⃣ Smart Refill Watch: Real-time inventory estimation warning families before vital medications run out.

🛠️ Built with the modern MERN stack:
• Frontend: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons
• Backend: Node.js, Express, Mongoose / MongoDB Atlas, Zod, Resend Email
• Architecture: Serverless-ready monorepo with strict RBAC & audit logging

Check out the full GitHub repository with architecture diagrams and demo guide:
🔗 https://github.com/your-username/saathicare

A special thanks to the organizers and community at Makers Need More (@Makers Need More)!

#MakersNeedMore #HealthcareTech #FullStack #MERN #Accessibility #A11y #React #MongoDB #TypeScript #OpenSource
```

---

<p align="center">
  Crafted with care for older adults and their families everywhere.
</p>
