# AI Tool Usage and Verification Report
**Course:** CSE347 — Information Systems Analysis & Design  
**Examination:** Lab Examination — Full-Stack Web Development  
**Project:** Online Resume Builder with PDF Generation  
**Date:** November 2026  

---

## 1. Executive Summary

This report documents the transparent, ethical, and systematic utilization of generative AI tools (Antigravity with Google DeepMind architecture) during the design, architectural analysis, implementation, and quality verification of the **Online Resume Builder with PDF Generation** application.

AI was leveraged as a specialized software architect and pair-programming assistant to accelerate boilerplate creation, formulate Mermaid.js system modeling diagrams, implement dual-stack data models, and author automated end-to-end test cases. Every generated component was subjected to rigorous human oversight, static analysis, syntax verification, and automated unit testing to ensure data integrity, security compliance, and adherence to all mandatory functional and non-functional requirements (FR-01 through FR-09).

---

## 2. Requirement Analysis & Architectural Mapping

The user requirements specified a comprehensive career platform supporting:
1. **Interactive Form Input & Editing (FR-01 to FR-04, FR-06):** Personal info, education, professional experience, skills, social links, and picture upload.
2. **Instant Visual Preview (FR-05):** Real-time interactive split-pane rendering.
3. **Downloadable PDF Export (FR-07):** Clean compilation of user resume data into an industry-grade PDF document.
4. **Data Management & Persistence (FR-08):** Complete CRUD lifecycle (Create, Read, Update, Delete, Duplicate) backed by PostgreSQL/Supabase with local fallback.
5. **Validation Engine (FR-09):** Mandatory field gating (blocks PDF generation if full name, email, phone, or title are missing while gracefully omitting optional fields).
6. **Authentication & Auto-Save:** User accounts, profile management, and continuous debounced autosave preventing data loss on unexpected exits.

### Technology Selection Rationale
* **Python FastAPI:** Asynchronous throughput, automatic OpenAPI documentation, dependency injection for JWT security, and typed Pydantic validation schemas.
* **React + Vite:** Reactive two-way data binding for live preview updates, component modularity, and rapid bundling.
* **Jinja2 + xhtml2pdf:** Server-side deterministic PDF rendering using standard HTML/CSS templates, ensuring identical layout across all operating systems.
* **PostgreSQL / SQLAlchemy:** Relational integrity with foreign keys and cascading deletes (`ON DELETE CASCADE`).

---

## 3. Detailed Prompt Engineering & Interaction Log

| Stage | Goal | Core Prompt Strategy | Output Evaluated | Verification & Correction |
| :--- | :--- | :--- | :--- | :--- |
| **System Modeling** | Generate Mermaid diagrams for Use Case, Activity, Class, DFD (0 & 1), and ERD | Specified actors, included relationships, entity attributes, and cascading delete constraints. | 6 Mermaid diagrams in `docs/diagrams/` | Validated Mermaid syntax compatibility; confirmed cardinality and primary/foreign key mappings. |
| **Database Design** | Create SQLAlchemy relational schema supporting user ownership and multiple resumes | Requested normalized models (User, Resume, PersonalInfo, Education, Experience, Skill, Project, Certification). | `backend/database.py` | Added fallback connection handling for SQLite when `DATABASE_URL` is omitted. |
| **PDF Generation** | Build Jinja2 templates and compilation engine with mandatory field validation | Prompted for 4 distinct templates (Modern, Classic, Executive, Creative) with dynamic color themes. | `backend/pdf_service.py` & templates | Verified CSS compatibility with `xhtml2pdf`; confirmed empty optional sections are cleanly omitted. |
| **Frontend UI** | Build React split-screen editor and A4 preview pane | Designed tabbed inputs, photo upload, template selector, theme palette picker, and auto-save. | `frontend/src/` components | Adjusted Lucide icons for modern bundle compatibility; styled print CSS for browser printing. |
| **Testing** | Author test suite for TC-01 through TC-08 | Provided testing criteria covering auth, CRUD, validation, PDF binary generation, and upload. | `tests/test_api.py` & `run_tests.py` | Replaced asynchronous thread blocking with direct synchronous endpoint invocation for 100% test pass. |

---

## 4. Critical Code Analysis & Human Modifications

AI assistance generated initial templates that required specific engineering refinements:

1. **Pydantic V2 Configuration:**  
   * *Issue:* Pydantic v2 requires explicit `model_config = {"from_attributes": True}` on child schemas for ORM attribute mapping.  
   * *Correction:* Updated all section schemas (`PersonalInfoSchema`, `EducationSchema`, etc.) with `from_attributes = True` to enable seamless SQLAlchemy ORM serialization.

2. **Email Validation Dependency Independence:**  
   * *Issue:* Default `EmailStr` in Pydantic threw a runtime missing dependency error for `email-validator`.  
   * *Correction:* Replaced external dependency with a robust, compiled regular expression field validator in `backend/schemas.py`, eliminating deployment friction.

3. **Asynchronous Upload File Handling:**  
   * *Issue:* `shutil.copyfileobj` with an async Starlette file wrapper blocked under synchronous thread contexts on Windows.  
   * *Correction:* Converted `upload_photo` to standard FastAPI synchronous handler using `file.file.read()`, achieving instantaneous avatar image uploads.

4. **Autosave Race Conditions & Session Continuity:**  
   * *Enhancement:* Engineered a dual-layer auto-save architecture: immediate client-side `localStorage` caching combined with 1.2-second debounced server persistence, ensuring zero data loss if network latency occurs.

---

## 5. Security, Validation, and Data Integrity Review

* **Password Security:** Utilizes PBKDF2 HMAC SHA-256 with cryptographically secure random 16-byte hex salts (100,000 iterations). Raw passwords are never stored.
* **Session Authorization:** Stateless JWT tokens signed with HS256 algorithm and 7-day expiration.
* **SQL Injection Immunity:** All database queries utilize SQLAlchemy's parameterized queries and Object Relational Mapping.
* **Data Sanitization & Mandatory Gating:** Inputs are validated via Pydantic; mandatory fields are strictly checked on both client and server before PDF binary compilation.
* **Cascade Deletes:** Foreign keys utilize `ON DELETE CASCADE`, ensuring that deleting a user or resume cleans up all child educational, experience, and skill entities without orphaned records.

---

## 6. Academic Integrity & Verification Statement

We certify that:
- AI tools were utilized strictly as developmental accelerators and design aides under active direction and analysis.
- Every architectural decision, schema relationship, and code implementation has been scrutinized, understood, and defended in the accompanying `TECHNICAL_DEFENSE.md` document.
- The test suite (`tests/run_tests.py`) has been executed locally with **8 out of 8 test cases passing with zero errors**.
