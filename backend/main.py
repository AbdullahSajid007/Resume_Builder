import os
import shutil
import uuid
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from .database import (
    init_db, get_db, User, Resume, PersonalInfo,
    Education, Experience, Skill, Project, Certification
)
from .schemas import (
    UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse,
    ResumeData, ResumeCreate, ResumeUpdate, ResumeSummaryResponse, ResumeDetailResponse,
    ValidationResult
)
from .auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_optional_current_user
)
from .pdf_service import (
    render_resume_html, generate_pdf_from_html, validate_resume_for_export
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
STATIC_DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def seed_sample_data(db: Session):
    """Seed initial demo user and comprehensive sample resume for testing."""
    existing_user = db.query(User).filter(User.email == "demo@candidate.com").first()
    if not existing_user:
        demo_user = User(
            name="Alex Morgan",
            email="demo@candidate.com",
            password_hash=hash_password("DemoPassword123!"),
            phone="+1 (555) 019-2834",
            avatar_url=""
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        sample_resume = Resume(
            user_id=demo_user.id,
            title="Senior Full Stack Software Engineer",
            template_name="modern",
            theme_color="#1e3a8a",
            font_family="Inter",
            is_draft=False
        )
        db.add(sample_resume)
        db.commit()
        db.refresh(sample_resume)

        personal = PersonalInfo(
            resume_id=sample_resume.id,
            full_name="Alex Morgan",
            email="demo@candidate.com",
            phone="+1 (555) 019-2834",
            location="San Francisco, CA / Remote",
            professional_title="Senior Full-Stack & Cloud Systems Architect",
            summary="Dynamic software engineer with 5+ years building scalable web architectures, microservices, and reactive SPAs. Proven record leading distributed teams and driving 99.99% system availability.",
            photo_url="",
            linkedin_url="linkedin.com/in/alexmorgan-dev",
            github_url="github.com/alexmorgan-code",
            portfolio_url="alexmorgan.dev",
            twitter_url="x.com/alexmorgan_dev",
            leetcode_url="leetcode.com/alexmorgan"
        )
        db.add(personal)

        edu1 = Education(
            resume_id=sample_resume.id,
            degree="B.Sc. in Computer Science & Engineering",
            institution="Metropolitan University",
            location="San Francisco, CA",
            start_year="2017",
            end_year="2021",
            cgpa="3.92 / 4.00",
            achievements="Dean's List for Academic Excellence, Capstone Award for AI-driven Career Platform."
        )
        db.add(edu1)

        exp1 = Experience(
            resume_id=sample_resume.id,
            job_title="Lead Backend Engineer",
            company="Nexus Cloud Innovations",
            location="San Francisco, CA",
            start_date="2023",
            end_date="Present",
            is_current=True,
            responsibilities="Architected high-throughput RESTful & GraphQL microservices with FastAPI and PostgreSQL, slashing API p99 latency by 35%. Spearheaded CI/CD pipelines on Render and AWS."
        )
        exp2 = Experience(
            resume_id=sample_resume.id,
            job_title="Full-Stack Developer",
            company="Apex Technologies Inc.",
            location="Austin, TX",
            start_date="2021",
            end_date="2023",
            is_current=False,
            responsibilities="Engineered responsive client dashboards with React and Redux. Integrated automated PDF export engines and secure payment gateways handling 100k+ transactions."
        )
        db.add_all([exp1, exp2])

        skills = [
            Skill(resume_id=sample_resume.id, name="Python & FastAPI", category="Technical", proficiency_level="Expert"),
            Skill(resume_id=sample_resume.id, name="React & TypeScript", category="Technical", proficiency_level="Advanced"),
            Skill(resume_id=sample_resume.id, name="PostgreSQL & SQLAlchemy", category="Technical", proficiency_level="Expert"),
            Skill(resume_id=sample_resume.id, name="Docker & Cloud Hosting", category="Technical", proficiency_level="Advanced"),
            Skill(resume_id=sample_resume.id, name="Agile Leadership", category="Soft", proficiency_level="Expert"),
            Skill(resume_id=sample_resume.id, name="System Design & Modeling", category="Technical", proficiency_level="Expert")
        ]
        db.add_all(skills)

        proj1 = Project(
            resume_id=sample_resume.id,
            title="Distributed Analytics Engine",
            description="Built real-time streaming pipeline processing 10,000 events/sec with automated report exports.",
            technologies="Python, FastAPI, Kafka, Redis, PostgreSQL",
            project_url="https://github.com/alexmorgan-code/distributed-analytics"
        )
        db.add(proj1)

        cert1 = Certification(
            resume_id=sample_resume.id,
            name="AWS Certified Solutions Architect – Associate",
            issuing_org="Amazon Web Services",
            issue_date="2023",
            cert_url="https://aws.amazon.com/certification"
        )
        db.add(cert1)

        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and run seeds
    init_db()
    db = next(get_db())
    try:
        seed_sample_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Online Resume Builder API",
    description="Full-stack Online Resume Builder with PDF Generation, User Authentication, Real-time Previews, and Auto-save.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# -------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
        phone=user_data.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/auth/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.avatar_url is not None:
        current_user.avatar_url = profile_data.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user


# -------------------------------------------------------------
# PICTURE / AVATAR UPLOAD ENDPOINT
# -------------------------------------------------------------
@app.post("/api/upload-photo")
def upload_photo(file: UploadFile = File(...)):
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are permitted (JPEG, PNG, WEBP).")

    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    contents = file.file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
        "message": "Photo uploaded successfully"
    }


# -------------------------------------------------------------
# HELPER FUNCTIONS TO BUILD RESUME OBJECTS
# -------------------------------------------------------------
def populate_resume_sections(resume: Resume, data: ResumeData, db: Session):
    """Synchronize resume child entities with incoming data."""
    resume.title = data.title or "Untitled Resume"
    resume.template_name = data.template_name or "modern"
    resume.theme_color = data.theme_color or "#1e3a8a"
    resume.font_family = data.font_family or "Inter"
    resume.is_draft = data.is_draft

    # Personal Info
    if not resume.personal_info:
        resume.personal_info = PersonalInfo(resume_id=resume.id)

    pi = resume.personal_info
    pi.full_name = data.personal_info.full_name or ""
    pi.email = data.personal_info.email or ""
    pi.phone = data.personal_info.phone or ""
    pi.location = data.personal_info.location or ""
    pi.professional_title = data.personal_info.professional_title or ""
    pi.summary = data.personal_info.summary or ""
    pi.photo_url = data.personal_info.photo_url or ""
    pi.linkedin_url = data.personal_info.linkedin_url or ""
    pi.github_url = data.personal_info.github_url or ""
    pi.portfolio_url = data.personal_info.portfolio_url or ""
    pi.twitter_url = data.personal_info.twitter_url or ""
    pi.leetcode_url = data.personal_info.leetcode_url or ""

    # Re-sync educations
    resume.educations.clear()
    for edu in data.educations:
        resume.educations.append(Education(
            degree=edu.degree or "",
            institution=edu.institution or "",
            location=edu.location or "",
            start_year=edu.start_year or "",
            end_year=edu.end_year or "",
            cgpa=edu.cgpa or "",
            achievements=edu.achievements or ""
        ))

    # Re-sync experiences
    resume.experiences.clear()
    for exp in data.experiences:
        resume.experiences.append(Experience(
            job_title=exp.job_title or "",
            company=exp.company or "",
            location=exp.location or "",
            start_date=exp.start_date or "",
            end_date=exp.end_date or "",
            is_current=exp.is_current,
            responsibilities=exp.responsibilities or ""
        ))

    # Re-sync skills
    resume.skills.clear()
    for s in data.skills:
        resume.skills.append(Skill(
            name=s.name or "",
            category=s.category or "Technical",
            proficiency_level=s.proficiency_level or "Advanced"
        ))

    # Re-sync projects
    resume.projects.clear()
    for p in data.projects:
        resume.projects.append(Project(
            title=p.title or "",
            description=p.description or "",
            technologies=p.technologies or "",
            project_url=p.project_url or ""
        ))

    # Re-sync certifications
    resume.certifications.clear()
    for c in data.certifications:
        resume.certifications.append(Certification(
            name=c.name or "",
            issuing_org=c.issuing_org or "",
            issue_date=c.issue_date or "",
            cert_url=c.cert_url or ""
        ))


# -------------------------------------------------------------
# RESUME CRUD & AUTOSAVE ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/resumes", response_model=List[ResumeSummaryResponse])
def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all resumes owned by the logged-in user."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.updated_at.desc()).all()
    return resumes


@app.post("/api/resumes", response_model=ResumeDetailResponse)
def create_resume(
    resume_data: ResumeCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Create a new resume (assigned to user if logged in, or draft)."""
    user_id = current_user.id if current_user else None
    resume = Resume(
        user_id=user_id,
        title=resume_data.title or "New Resume",
        template_name=resume_data.template_name or "modern",
        theme_color=resume_data.theme_color or "#1e3a8a",
        font_family=resume_data.font_family or "Inter",
        is_draft=resume_data.is_draft
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    populate_resume_sections(resume, resume_data, db)
    db.commit()
    db.refresh(resume)
    return resume


@app.get("/api/resumes/{resume_id}", response_model=ResumeDetailResponse)
def get_resume_by_id(
    resume_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Fetch complete resume details by ID."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    if current_user and resume.user_id and resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this resume.")

    return resume


@app.put("/api/resumes/{resume_id}", response_model=ResumeDetailResponse)
def update_resume(
    resume_id: int,
    resume_data: ResumeUpdate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Update existing resume and its child sections."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    if current_user and resume.user_id and resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this resume.")

    # If user logged in and resume had no owner, bind it
    if current_user and not resume.user_id:
        resume.user_id = current_user.id

    populate_resume_sections(resume, resume_data, db)
    db.commit()
    db.refresh(resume)
    return resume


@app.delete("/api/resumes/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume by ID."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or unauthorized.")

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully", "id": resume_id}


@app.post("/api/resumes/{resume_id}/duplicate", response_model=ResumeDetailResponse)
def duplicate_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Duplicate an existing resume."""
    original = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original resume not found.")

    new_resume = Resume(
        user_id=current_user.id,
        title=f"{original.title} (Copy)",
        template_name=original.template_name,
        theme_color=original.theme_color,
        font_family=original.font_family,
        is_draft=original.is_draft
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Copy personal info
    if original.personal_info:
        pi = original.personal_info
        new_resume.personal_info = PersonalInfo(
            resume_id=new_resume.id,
            full_name=pi.full_name,
            email=pi.email,
            phone=pi.phone,
            location=pi.location,
            professional_title=pi.professional_title,
            summary=pi.summary,
            photo_url=pi.photo_url,
            linkedin_url=pi.linkedin_url,
            github_url=pi.github_url,
            portfolio_url=pi.portfolio_url,
            twitter_url=pi.twitter_url,
            leetcode_url=pi.leetcode_url
        )

    # Copy educations
    for e in original.educations:
        new_resume.educations.append(Education(
            degree=e.degree, institution=e.institution, location=e.location,
            start_year=e.start_year, end_year=e.end_year, cgpa=e.cgpa, achievements=e.achievements
        ))

    # Copy experiences
    for ex in original.experiences:
        new_resume.experiences.append(Experience(
            job_title=ex.job_title, company=ex.company, location=ex.location,
            start_date=ex.start_date, end_date=ex.end_date, is_current=ex.is_current, responsibilities=ex.responsibilities
        ))

    # Copy skills
    for s in original.skills:
        new_resume.skills.append(Skill(
            name=s.name, category=s.category, proficiency_level=s.proficiency_level
        ))

    # Copy projects
    for p in original.projects:
        new_resume.projects.append(Project(
            title=p.title, description=p.description, technologies=p.technologies, project_url=p.project_url
        ))

    # Copy certifications
    for c in original.certifications:
        new_resume.certifications.append(Certification(
            name=c.name, issuing_org=c.issuing_org, issue_date=c.issue_date, cert_url=c.cert_url
        ))

    db.commit()
    db.refresh(new_resume)
    return new_resume


@app.post("/api/resumes/autosave")
def autosave_resume(
    resume_data: ResumeData,
    resume_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Auto-save draft. If resume_id provided, updates it; otherwise creates draft."""
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            if current_user and not resume.user_id:
                resume.user_id = current_user.id
            populate_resume_sections(resume, resume_data, db)
            db.commit()
            return {"status": "saved", "id": resume.id, "updated_at": resume.updated_at.isoformat()}

    # Create new draft
    user_id = current_user.id if current_user else None
    resume = Resume(
        user_id=user_id,
        title=resume_data.title or "Autosaved Draft",
        template_name=resume_data.template_name or "modern",
        theme_color=resume_data.theme_color or "#1e3a8a",
        font_family=resume_data.font_family or "Inter",
        is_draft=True
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    populate_resume_sections(resume, resume_data, db)
    db.commit()
    db.refresh(resume)
    return {"status": "created", "id": resume.id, "updated_at": resume.updated_at.isoformat()}


# -------------------------------------------------------------
# VALIDATION, PREVIEW & PDF EXPORT ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/validate", response_model=ValidationResult)
def validate_criteria(data: ResumeData):
    """Verify mandatory requirements before generating or downloading PDF."""
    return validate_resume_for_export(data)


@app.post("/api/preview", response_class=HTMLResponse)
def render_live_preview(data: ResumeData):
    """Render HTML preview for active frontend state."""
    html_output = render_resume_html(data)
    return HTMLResponse(content=html_output)


@app.get("/api/resumes/{resume_id}/preview", response_class=HTMLResponse)
def render_saved_resume_preview(resume_id: int, db: Session = Depends(get_db)):
    """Render HTML preview for stored resume record."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    data = ResumeDetailResponse.from_orm(resume)
    html_output = render_resume_html(data)
    return HTMLResponse(content=html_output)


@app.post("/api/export-pdf")
def export_pdf(data: ResumeData):
    """Validate mandatory fields and export PDF stream."""
    val = validate_resume_for_export(data)
    if not val.valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": val.message, "missing_fields": val.missing_mandatory_fields}
        )

    html_content = render_resume_html(data)
    try:
        pdf_bytes = generate_pdf_from_html(html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF rendering error: {str(e)}")

    clean_name = (data.personal_info.full_name or "Resume").replace(" ", "_")
    filename = f"{clean_name}_Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.get("/api/resumes/{resume_id}/pdf")
def export_saved_resume_pdf(resume_id: int, db: Session = Depends(get_db)):
    """Export stored resume record to downloadable PDF."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    data = ResumeDetailResponse.from_orm(resume)
    val = validate_resume_for_export(data)
    if not val.valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": val.message, "missing_fields": val.missing_mandatory_fields}
        )

    html_content = render_resume_html(data)
    try:
        pdf_bytes = generate_pdf_from_html(html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF rendering error: {str(e)}")

    clean_name = (data.personal_info.full_name or "Resume").replace(" ", "_")
    filename = f"{clean_name}_Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Online Resume Builder Backend", "version": "1.0.0"}


# Serve static frontend if built
if os.path.exists(STATIC_DIST_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIST_DIR, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

