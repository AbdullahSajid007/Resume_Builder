from typing import List, Optional
from datetime import datetime
import re
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email address format")
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Resume Sections Schemas
class PersonalInfoSchema(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: Optional[str] = ""
    professional_title: Optional[str] = ""
    summary: Optional[str] = ""
    photo_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""
    twitter_url: Optional[str] = ""
    leetcode_url: Optional[str] = ""

    model_config = {"from_attributes": True}

class EducationSchema(BaseModel):
    id: Optional[int] = None
    degree: str = ""
    institution: str = ""
    location: Optional[str] = ""
    start_year: Optional[str] = ""
    end_year: str = ""
    cgpa: Optional[str] = ""
    achievements: Optional[str] = ""

    model_config = {"from_attributes": True}

class ExperienceSchema(BaseModel):
    id: Optional[int] = None
    job_title: str = ""
    company: str = ""
    location: Optional[str] = ""
    start_date: str = ""
    end_date: Optional[str] = ""
    is_current: bool = False
    responsibilities: Optional[str] = ""

    model_config = {"from_attributes": True}

class SkillSchema(BaseModel):
    id: Optional[int] = None
    name: str = ""
    category: str = "Technical"  # Technical, Soft, Tool, Language
    proficiency_level: str = "Advanced"

    model_config = {"from_attributes": True}

class ProjectSchema(BaseModel):
    id: Optional[int] = None
    title: str = ""
    description: Optional[str] = ""
    technologies: Optional[str] = ""
    project_url: Optional[str] = ""

    model_config = {"from_attributes": True}

class CertificationSchema(BaseModel):
    id: Optional[int] = None
    name: str = ""
    issuing_org: Optional[str] = ""
    issue_date: Optional[str] = ""
    cert_url: Optional[str] = ""

    model_config = {"from_attributes": True}

# Full Resume Schemas
class ResumeData(BaseModel):
    title: str = "My Professional Resume"
    template_name: str = "modern"  # modern, classic, executive, creative
    theme_color: str = "#1e3a8a"
    font_family: str = "Inter"
    is_draft: bool = False
    personal_info: PersonalInfoSchema = Field(default_factory=PersonalInfoSchema)
    educations: List[EducationSchema] = Field(default_factory=list)
    experiences: List[ExperienceSchema] = Field(default_factory=list)
    skills: List[SkillSchema] = Field(default_factory=list)
    projects: List[ProjectSchema] = Field(default_factory=list)
    certifications: List[CertificationSchema] = Field(default_factory=list)

class ResumeCreate(ResumeData):
    pass

class ResumeUpdate(ResumeData):
    pass

class ResumeSummaryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    template_name: str
    theme_color: str
    is_draft: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeDetailResponse(ResumeData):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ValidationResult(BaseModel):
    valid: bool
    missing_mandatory_fields: List[str] = []
    message: str
