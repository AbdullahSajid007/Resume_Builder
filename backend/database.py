import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Database URL resolution: Supabase / PostgreSQL or local SQLite fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resume_builder.db")

# If PostgreSQL URL uses postgres:// instead of postgresql:// (e.g. older Heroku / Supabase URLs)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(200), default="Untitled Resume")
    template_name = Column(String(50), default="modern")  # modern, classic, executive, creative
    theme_color = Column(String(50), default="#1e3a8a")
    font_family = Column(String(50), default="Inter")
    is_draft = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    personal_info = relationship("PersonalInfo", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="resume", cascade="all, delete-orphan", order_by="Education.id")
    experiences = relationship("Experience", back_populates="resume", cascade="all, delete-orphan", order_by="Experience.id")
    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan", order_by="Skill.id")
    projects = relationship("Project", back_populates="resume", cascade="all, delete-orphan", order_by="Project.id")
    certifications = relationship("Certification", back_populates="resume", cascade="all, delete-orphan", order_by="Certification.id")


class PersonalInfo(Base):
    __tablename__ = "personal_infos"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(150), default="")
    email = Column(String(150), default="")
    phone = Column(String(50), default="")
    location = Column(String(150), default="")
    professional_title = Column(String(150), default="")
    summary = Column(Text, default="")
    photo_url = Column(String(500), default="")
    linkedin_url = Column(String(250), default="")
    github_url = Column(String(250), default="")
    portfolio_url = Column(String(250), default="")
    twitter_url = Column(String(250), default="")
    leetcode_url = Column(String(250), default="")

    resume = relationship("Resume", back_populates="personal_info")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    degree = Column(String(150), default="")
    institution = Column(String(200), default="")
    location = Column(String(150), default="")
    start_year = Column(String(50), default="")
    end_year = Column(String(50), default="")
    cgpa = Column(String(50), default="")
    achievements = Column(Text, default="")

    resume = relationship("Resume", back_populates="educations")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(150), default="")
    company = Column(String(200), default="")
    location = Column(String(150), default="")
    start_date = Column(String(50), default="")
    end_date = Column(String(50), default="")
    is_current = Column(Boolean, default=False)
    responsibilities = Column(Text, default="")

    resume = relationship("Resume", back_populates="experiences")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), default="")
    category = Column(String(50), default="Technical")  # Technical, Soft, Language, Tool
    proficiency_level = Column(String(50), default="Advanced")  # Beginner, Intermediate, Advanced, Expert

    resume = relationship("Resume", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), default="")
    description = Column(Text, default="")
    technologies = Column(String(250), default="")
    project_url = Column(String(250), default="")

    resume = relationship("Resume", back_populates="projects")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), default="")
    issuing_org = Column(String(200), default="")
    issue_date = Column(String(50), default="")
    cert_url = Column(String(250), default="")

    resume = relationship("Resume", back_populates="certifications")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
