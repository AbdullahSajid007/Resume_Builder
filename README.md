# Online Resume Builder with PDF Generation
**CSE412: Information Systems Analysis & Design — Lab Examination**  
**Full-Stack Web Application**

A production-ready, feature-rich web platform that enables job seekers to create, edit, preview, manage, and export professional, ATS-friendly resumes. Built with a **Python FastAPI** backend, a reactive **React + Vite** frontend, a **PostgreSQL** database (with seamless local SQLite fallback), and a **Jinja2 + xhtml2pdf** document generation engine.

---

## 🌟 Key Features & Requirements Realization

* **Authentication & Profile Management:**
  * Secure Sign Up and Sign In powered by **PBKDF2 HMAC SHA-256** password hashing and stateless **JWT tokens**.
  * User profile management (Name, Phone, Email, Avatar).
  * 1-Click **Evaluator / Demo Login** for instant evaluation without manual typing.
* **Continuous Auto-Save & Draft Recovery:**
  * Dual-layer persistence: instant `localStorage` caching plus debounced (1.2s) server auto-save to the database.
  * If a user closes the browser or forgets to submit, their draft is safely restored upon next visit or login.
* **Multiple CV Management (CRUD):**
  * Manage multiple resumes per user account.
  * Create, Read, Update, Delete, and **Duplicate** resumes for tailoring to different job roles.
* **4 Professionally Designed Resume Templates:**
  * **Modern Minimalist:** Clean header bar, accent dividers, badge styling.
  * **Classic Professional:** Traditional academic/executive serif layout.
  * **Executive Two-Column:** Left sidebar for contact, avatar, and skills; right column for experience and education.
  * **Creative Tech:** Hero banner, tech stack pills, prominent project showcases.
* **6 Color Accent Themes + Custom Color Picker:**
  * Curated palettes (Corporate Navy, Emerald Green, Executive Slate, Royal Purple, Crimson Wine, Sunset Amber) plus arbitrary hex color support.
* **Mandatory Field Gating & Graceful Optional Fields:**
  * **Mandatory for PDF Export:** Full Name, Email Address, Phone Number, Professional Title.
  * Real-time client-side highlights and server-side validation (HTTP 400 with missing field checklist).
  * Optional fields (Photo, Social links, Projects, Certifications) are cleanly omitted without empty boxes if left blank.
* **Profile Picture / Avatar Upload:**
  * Upload custom JPEG/PNG profile photos with preview and removal controls.
* **Social Media & Online Links:**
  * Integrated fields for LinkedIn, GitHub, Portfolio Website, Twitter/X, and LeetCode / Coding profiles.
* **Dual Document Export:**
  * Server-side downloadable binary PDF generated via Jinja2 + xhtml2pdf.
  * Client-side pixel-perfect print layout via `@media print` and browser print dialog.

---

## 🏗️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | Python 3.14 / 3.13 | FastAPI, Uvicorn, Pydantic v2, Jinja2, ReportLab, xhtml2pdf |
| **Security** | Python-Jose, Passlib | JWT (HS256), PBKDF2 HMAC SHA-256 with random 16-byte salt |
| **Database** | PostgreSQL & SQLite | SQLAlchemy 2.0 ORM, Supabase support with automatic local SQLite fallback |
| **Frontend** | React 19, Vite, Lucide | Responsive CSS3, split-pane layout, real-time live A4 preview |
| **Diagrams** | Mermaid.js | Use Case, Activity, Class, DFD (Level 0 & 1), ERD |
| **Deployment**| Render | `render.yaml`, `Procfile`, multi-stage build |

---

## 📊 System Design Diagrams

All mandatory Mermaid diagrams are located in `docs/diagrams/`:
* `docs/diagrams/use_case_diagram.mmd` — Use Case Diagram (Actors: Candidate, System)
* `docs/diagrams/activity_diagram.mmd` — Activity Diagram (Complete candidate workflow)
* `docs/diagrams/class_diagram.mmd` — Class Diagram (Object-oriented model)
* `docs/diagrams/dfd_level_0.mmd` — Data Flow Diagram (Level 0 Context Diagram)
* `docs/diagrams/dfd_level_1.mmd` — Data Flow Diagram (Level 1 Functional Processes)
* `docs/diagrams/er_diagram.mmd` — Entity Relationship Diagram (Normalized relational schema)

---

## 🚀 Quick Start Guide

### Prerequisites
* Python 3.11+ (Tested on Python 3.13 and Python 3.14)
* Node.js 18+ and npm

### 1. Install Dependencies

#### Backend:
```bash
pip install -r requirements.txt
```

#### Frontend:
```bash
cd frontend
npm install
npm run build
cd ..
```

---

### 2. Run the Application

#### Option A: Single Command (Production Mode - Serves both Frontend & Backend)
FastAPI serves the built React frontend at `/` and the REST API at `/api`:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

#### Option B: Dual Development Mode (with Vite Hot Reload)
1. **Start Backend Server:**
   ```bash
   python -m uvicorn backend.main:app --port 8000 --reload
   ```
2. **Start Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** (requests to `/api` and `/uploads` are automatically proxied to the backend).

---

## 🔑 Pre-populated Evaluator Credentials

The database automatically seeds a demo user and full resume on startup:
* **Demo Email:** `demo@candidate.com`
* **Demo Password:** `DemoPassword123!`
* Or simply click the **"Instant Demo Login (Evaluator Mode)"** button inside the Sign In modal!

---

## 🧪 Automated Testing & Verification

A comprehensive test suite verifies all critical functionality:
```bash
python tests/run_tests.py
```

### Verification Checklist:
| Test ID | Scenario | Status |
| :--- | :--- | :--- |
| **TC-01** | Health Check & Service Status | **PASS** |
| **TC-02** | User Registration & JWT Authentication | **PASS** |
| **TC-03** | Resume Creation with All Relational Child Sections | **PASS** |
| **TC-04** | Continuous Database Auto-Save & Draft Persistence | **PASS** |
| **TC-05** | Mandatory Fields Validation & PDF Export Blocking | **PASS** |
| **TC-06** | PDF Generation for 4 Design Templates | **PASS** |
| **TC-07** | Resume CRUD Operations (Duplicate & Cascade Delete) | **PASS** |
| **TC-08** | Profile Photo / Avatar Upload Engine | **PASS** |

---

## ☁️ Deployment Guide (Render)

1. Link your GitHub repository to [Render.com](https://render.com).
2. Choose **Web Service** with the Python environment.
3. Configure the following settings:
   * **Build Command:** `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`
   * **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   * `DATABASE_URL`: Your Supabase or Render PostgreSQL connection string (e.g. `postgresql://...`). If left blank, SQLite is used automatically.
   * `JWT_SECRET`: Random secret string for signing JWT tokens.

---

## 📄 Documentation Directory

* [`docs/AI_USAGE_REPORT.md`](docs/AI_USAGE_REPORT.md): Formal AI Tool Usage Report.
* [`docs/TECHNICAL_DEFENSE.md`](docs/TECHNICAL_DEFENSE.md): Viva preparation and architectural defense guide.
* [`docs/diagrams/`](docs/diagrams/): Complete Mermaid.js design diagrams.
