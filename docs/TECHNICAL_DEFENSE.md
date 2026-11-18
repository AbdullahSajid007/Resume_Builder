# Technical Defense and Viva Preparation Guide
**Course:** CSE347 — Information Systems Analysis & Design  
**Examination:** Lab Examination — Full-Stack Web Development  
**Project:** Online Resume Builder with PDF Generation  

---

## 1. Architectural Justifications

### 1.1 Backend: Why FastAPI over Flask or Django?
* **High Performance & Async Support:** Built on Starlette and Uvicorn, FastAPI provides asynchronous concurrency comparable to Node.js and Go.
* **Automatic OpenAPI / Swagger Documentation:** FastAPI automatically generates interactive `/docs` and `/redoc` interfaces directly from Python type annotations.
* **Built-in Schema Validation:** Pydantic models automatically validate incoming requests, reject malformed payloads with descriptive 422 errors, and sanitize outputs.
* **Dependency Injection:** FastAPI’s dependency system simplifies database session management (`get_db`) and JWT authentication (`get_current_user`).

### 1.2 Frontend: Why React + Vite?
* **Instant Reactive Updates:** React’s unidirectional data flow and virtual DOM ensure that as the candidate types in any form input, the live preview sheet updates with zero latency.
* **Component-Based Modularity:** The editor is decomposed into clean, maintainable components (`Navbar`, `EditorPane`, `PreviewPane`, `AuthModal`, `ResumeManagerModal`, `ProfileModal`).
* **Vite Development Velocity:** Ultra-fast Hot Module Replacement (HMR) and optimized Rollup production builds.

### 1.3 PDF Generation Engine: Jinja2 + xhtml2pdf
* **Deterministic Server-Side Output:** Uses Jinja2 templates (`modern.html`, `classic.html`, `executive.html`, `creative.html`) to compile exact HTML/CSS into a binary PDF stream.
* **Resource Efficiency:** Pure Python pipeline using ReportLab and xhtml2pdf, requiring no heavy headless browsers or external C-bindings in production.
* **Dual Export Strategy:** Provides both server-side PDF download (`/api/export-pdf`) and high-fidelity browser print rendering (`@media print` + `window.print()`).

---

## 2. Database Design & Normalization Analysis

### 2.1 Normalization (1NF through 3NF)
* **First Normal Form (1NF):** Every column contains atomic values. Array collections (educations, experiences, skills, projects, certifications) are separated into dedicated relational child tables.
* **Second Normal Form (2NF):** Every non-key attribute is fully functionally dependent on the primary key of each table. Child records reference their parent resume via foreign key `resume_id`.
* **Third Normal Form (3NF):** No transitive dependencies exist. User credentials and profile attributes reside in `users`, while resume metadata and styling reside in `resumes`.

### 2.2 Relational Integrity & Cascading Constraints
* Primary keys (`id`) on all tables with integer auto-increment indexes.
* Foreign keys with `ON DELETE CASCADE`:
  - When a `User` is deleted, all owned `Resume` records are deleted automatically.
  - When a `Resume` is deleted, its `PersonalInfo`, `Education`, `Experience`, `Skill`, `Project`, and `Certification` entities are pruned automatically by the database engine, preventing orphaned rows.
* Unique constraints on `User.email` ensure single-account integrity.

---

## 3. Security & Input Sanitization Architecture

1. **Password Hashing:**
   * Utilizes **PBKDF2 HMAC SHA-256** with 100,000 iterations and a unique 16-byte random salt per user.
   * Defends against rainbow table attacks and dictionary cracking.
2. **Stateless Authentication:**
   * Issues cryptographic JWT tokens containing subject identifier and expiration timestamp.
   * Protected endpoints decrypt and verify signatures on every request.
3. **SQL Injection Defense:**
   * 100% of database interactions run through SQLAlchemy ORM with parameterized SQL queries. User input is never concatenated into raw SQL strings.
4. **CORS & Endpoint Security:**
   * Configured CORS middleware allows controlled cross-origin access.
   * File upload endpoint validates MIME types (`image/*`) and renames uploads with random UUIDs to prevent directory traversal and arbitrary file execution.

---

## 4. Key Functional Implementations

### 4.1 Auto-Save & Unsubmitted Data Recovery
* **The Problem:** In conventional web forms, if a user navigates away, closes the tab, or encounters a network drop before clicking "Submit", all entered work is lost.
* **The Solution:** Dual-layer auto-save architecture:
  1. **Immediate Local Cache:** Every keystroke is saved to `localStorage.setItem('local_resume_draft', ...)` instantly.
  2. **Debounced Server Auto-Save:** A 1200ms debounce timer sends the draft state to `/api/resumes/autosave`. If the candidate is logged in, it stores the draft in the database; if guest, it stores the draft and associates it upon subsequent login/registration.

### 4.2 Mandatory vs. Optional Fields Gating
* **Mandatory Criteria for PDF Export:**
  - Full Name (`personal_info.full_name`)
  - Email Address (`personal_info.email`)
  - Phone Number (`personal_info.phone`)
  - Professional Title (`personal_info.professional_title`)
* **Behavior:**
  - If any mandatory field is missing, client-side highlights the input with red borders, displays an explanatory banner, and the backend returns HTTP 400 with a detailed field checklist.
* **Optional Handling:**
  - Optional fields (profile photo, secondary social links, certifications, hobbies, academic achievements) are gracefully omitted from both the HTML preview and the compiled PDF without leaving awkward blank placeholders.

---

## 5. Verification Matrix (Test Execution Summary)

| Test ID | Scenario | Verified Outcome | Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Health check & static root endpoint | API returns `{"status":"ok"}`; root serves React SPA | **PASS** |
| **TC-02** | User registration & JWT authentication | User persisted in DB; PBKDF2 hash verified; JWT issued | **PASS** |
| **TC-03** | Resume creation with complete child sections | Resume, PersonalInfo, Edu, Exp, Skills, Projects created | **PASS** |
| **TC-04** | Debounced auto-save draft functionality | Auto-save creates draft & updates existing records | **PASS** |
| **TC-05** | Mandatory field validation and export blocking | Missing fields reject PDF export with HTTP 400 | **PASS** |
| **TC-06** | PDF generation across all 4 design templates | Valid binary PDF generated for Modern, Classic, Executive, Creative | **PASS** |
| **TC-07** | Resume CRUD operations (Duplicate & Delete) | Deep-copy duplication and cascading deletion verified | **PASS** |
| **TC-08** | Profile picture / avatar upload engine | Upload saves image to disk and returns static URL | **PASS** |

**Overall Verification Status:** 8 / 8 Test Cases Passed (100% Success Rate).
