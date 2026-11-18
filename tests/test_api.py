import os
import io
import uuid
from starlette.datastructures import UploadFile
from fastapi import HTTPException
from backend.database import init_db, SessionLocal, User, Resume
from backend.schemas import (
    UserCreate, UserLogin, ResumeCreate, ResumeUpdate, ResumeData,
    PersonalInfoSchema, EducationSchema, ExperienceSchema, SkillSchema,
    ProjectSchema, CertificationSchema
)
from backend.main import (
    health_check, register, login, create_resume, update_resume,
    delete_resume, duplicate_resume, autosave_resume, validate_criteria,
    export_pdf, upload_photo, seed_sample_data
)

def get_test_db():
    init_db()
    db = SessionLocal()
    try:
        seed_sample_data(db)
    except Exception:
        db.rollback()
    return db


def test_tc01_health_check():
    res = health_check()
    assert res["status"] == "ok"
    assert "service" in res


def test_tc02_auth_register_and_login():
    db = get_test_db()
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    user_in = UserCreate(
        name="Sarah Connor",
        email=unique_email,
        password="SecurePassword2026!",
        phone="+1 555-0182"
    )

    # Register
    reg_out = register(user_in, db=db)
    assert reg_out["access_token"] is not None
    assert reg_out["user"].email == unique_email

    # Login
    login_in = UserLogin(email=unique_email, password="SecurePassword2026!")
    login_out = login(login_in, db=db)
    assert login_out["access_token"] is not None
    assert login_out["user"].id == reg_out["user"].id
    db.close()


def test_tc03_create_resume_with_sections():
    db = get_test_db()
    demo_user = db.query(User).filter(User.email == "demo@candidate.com").first()
    assert demo_user is not None

    resume_in = ResumeCreate(
        title="Full Stack Cloud Architect",
        template_name="executive",
        theme_color="#065f46",
        font_family="Inter",
        is_draft=False,
        personal_info=PersonalInfoSchema(
            full_name="Sarah Connor",
            email="sarah.connor@example.com",
            phone="+1 (555) 018-2938",
            location="Los Angeles, CA",
            professional_title="Chief Technology Officer",
            summary="Visionary technology leader with 10+ years driving cloud modernization.",
            linkedin_url="linkedin.com/in/sarahconnor",
            github_url="github.com/sarahconnor"
        ),
        educations=[
            EducationSchema(
                degree="B.S. in Computer Science",
                institution="UCLA",
                location="Los Angeles, CA",
                start_year="2012",
                end_year="2016",
                cgpa="3.90"
            )
        ],
        experiences=[
            ExperienceSchema(
                job_title="Lead Architect",
                company="Cyberdyne Systems",
                location="Sunnyvale, CA",
                start_date="2018",
                end_date="Present",
                is_current=True,
                responsibilities="Directed distributed AI computing grid."
            )
        ],
        skills=[
            SkillSchema(name="FastAPI", category="Technical", proficiency_level="Expert"),
            SkillSchema(name="PostgreSQL", category="Technical", proficiency_level="Expert")
        ],
        projects=[
            ProjectSchema(
                title="Distributed Grid",
                description="High scale cloud orchestration engine.",
                technologies="Python, Docker, Kubernetes"
            )
        ],
        certifications=[
            CertificationSchema(
                name="AWS Certified Solutions Architect",
                issuing_org="AWS",
                issue_date="2022"
            )
        ]
    )

    created = create_resume(resume_in, current_user=demo_user, db=db)
    assert created.id is not None
    assert created.personal_info.full_name == "Sarah Connor"
    assert len(created.educations) == 1
    assert len(created.experiences) == 1
    assert len(created.skills) == 2
    assert len(created.projects) == 1
    assert len(created.certifications) == 1
    db.close()


def test_tc04_autosave_draft():
    db = get_test_db()
    demo_user = db.query(User).filter(User.email == "demo@candidate.com").first()
    
    draft_data = ResumeData(
        title="Autosaved Work in Progress",
        template_name="modern",
        personal_info=PersonalInfoSchema(
            full_name="Sarah Draft",
            email="sarah@draft.com",
            phone="+1 555 0000",
            professional_title="Developer",
            summary="Initial summary before submission..."
        )
    )

    # Autosave new draft
    res1 = autosave_resume(draft_data, resume_id=None, current_user=demo_user, db=db)
    assert res1["status"] == "created"
    draft_id = res1["id"]

    # Autosave update on same resume
    draft_data.personal_info.summary = "Updated summary during live editing session."
    res2 = autosave_resume(draft_data, resume_id=draft_id, current_user=demo_user, db=db)
    assert res2["status"] == "saved"
    assert res2["id"] == draft_id

    # Verify updated in database
    db_record = db.query(Resume).filter(Resume.id == draft_id).first()
    assert db_record.personal_info.summary == "Updated summary during live editing session."
    db.close()


def test_tc05_mandatory_validation():
    # Incomplete resume missing full_name & phone
    invalid_data = ResumeData(
        title="Invalid Incomplete",
        personal_info=PersonalInfoSchema(
            full_name="",
            email="test@example.com",
            phone="",
            professional_title=""
        )
    )

    val = validate_criteria(invalid_data)
    assert val.valid is False
    assert "Full Name" in val.missing_mandatory_fields
    assert "Phone Number" in val.missing_mandatory_fields
    assert "Professional Title" in val.missing_mandatory_fields

    # Attempting export should raise HTTPException 400
    try:
        export_pdf(invalid_data)
        assert False, "Should have raised 400 HTTPException"
    except HTTPException as e:
        assert e.status_code == 400

    # Valid resume
    valid_data = ResumeData(
        title="Complete Valid",
        personal_info=PersonalInfoSchema(
            full_name="Alex Morgan",
            email="alex@morgan.com",
            phone="+1 555 1234",
            professional_title="Software Engineer"
        )
    )
    val_ok = validate_criteria(valid_data)
    assert val_ok.valid is True


def test_tc06_pdf_export_all_templates():
    templates = ["modern", "classic", "executive", "creative"]
    for tpl in templates:
        data = ResumeData(
            title=f"Sample {tpl} Resume",
            template_name=tpl,
            theme_color="#1e3a8a",
            personal_info=PersonalInfoSchema(
                full_name="Alex Morgan",
                email="alex@morgan.com",
                phone="+1 (555) 019-2834",
                professional_title="Senior Systems Engineer",
                summary="Dynamic engineer building scalable systems.",
                linkedin_url="linkedin.com/in/alexmorgan",
                github_url="github.com/alexmorgan"
            ),
            educations=[
                EducationSchema(
                    degree="B.Sc. in CS",
                    institution="MIT",
                    end_year="2020",
                    cgpa="3.9"
                )
            ],
            experiences=[
                ExperienceSchema(
                    job_title="Software Architect",
                    company="Innovations Inc",
                    start_date="2020",
                    end_date="Present",
                    is_current=True,
                    responsibilities="High scale backend architecture."
                )
            ],
            skills=[
                SkillSchema(name="Python", category="Technical", proficiency_level="Expert")
            ]
        )

        pdf_response = export_pdf(data)
        assert pdf_response.media_type == "application/pdf"
        assert len(pdf_response.body) > 1000
        assert "Content-Disposition" in pdf_response.headers


def test_tc07_crud_duplicate_and_delete():
    db = get_test_db()
    demo_user = db.query(User).filter(User.email == "demo@candidate.com").first()
    original = db.query(Resume).filter(Resume.user_id == demo_user.id).first()
    assert original is not None

    # Duplicate
    duplicated = duplicate_resume(original.id, current_user=demo_user, db=db)
    assert "(Copy)" in duplicated.title
    dup_id = duplicated.id

    # Verify duplicated has same personal info
    assert duplicated.personal_info.full_name == original.personal_info.full_name

    # Delete
    del_res = delete_resume(dup_id, current_user=demo_user, db=db)
    assert del_res["message"] == "Resume deleted successfully"

    # Confirm removed from DB
    check_del = db.query(Resume).filter(Resume.id == dup_id).first()
    assert check_del is None
    db.close()


def test_tc08_photo_upload():
    fake_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00"
    upload_file = UploadFile(
        filename="avatar.jpg",
        file=io.BytesIO(fake_bytes),
        headers={"content-type": "image/jpeg"}
    )
    result = upload_photo(upload_file)
    assert "url" in result
    assert result["url"].startswith("/uploads/")
    assert result["filename"].endswith(".jpg")
