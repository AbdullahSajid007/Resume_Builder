import os
import io
from typing import Dict, Any, Tuple, List
from jinja2 import Environment, FileSystemLoader, select_autoescape
from xhtml2pdf import pisa
from .schemas import ResumeData, ValidationResult

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(TEMPLATES_DIR, exist_ok=True)

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"])
)

MANDATORY_FIELDS = [
    ("personal_info.full_name", "Full Name"),
    ("personal_info.email", "Email Address"),
    ("personal_info.phone", "Phone Number"),
    ("personal_info.professional_title", "Professional Title / Headline"),
]

def validate_resume_for_export(data: ResumeData) -> ValidationResult:
    """Validate mandatory fields required before PDF can be generated."""
    missing = []
    
    if not data.personal_info.full_name or not data.personal_info.full_name.strip():
        missing.append("Full Name")
    if not data.personal_info.email or not data.personal_info.email.strip():
        missing.append("Email Address")
    if not data.personal_info.phone or not data.personal_info.phone.strip():
        missing.append("Phone Number")
    if not data.personal_info.professional_title or not data.personal_info.professional_title.strip():
        missing.append("Professional Title")
        
    if missing:
        return ValidationResult(
            valid=False,
            missing_mandatory_fields=missing,
            message=f"Cannot generate PDF. Mandatory fields missing: {', '.join(missing)}."
        )
    return ValidationResult(valid=True, missing_mandatory_fields=[], message="Validation passed.")


def render_resume_html(data: ResumeData) -> str:
    """Render resume using selected Jinja2 template and theme."""
    template_name = data.template_name.lower().strip()
    if template_name not in ["modern", "classic", "executive", "creative"]:
        template_name = "modern"

    template_file = f"{template_name}.html"
    try:
        template = env.get_template(template_file)
    except Exception:
        template = env.get_template("modern.html")

    return template.render(
        resume=data,
        info=data.personal_info,
        educations=data.educations,
        experiences=data.experiences,
        skills=data.skills,
        projects=data.projects,
        certifications=data.certifications,
        theme_color=data.theme_color or "#1e3a8a",
        font_family=data.font_family or "Inter, Arial, sans-serif"
    )


def generate_pdf_from_html(html_content: str) -> bytes:
    """Convert HTML string into PDF byte stream."""
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_content,
        dest=pdf_buffer,
        encoding="utf-8"
    )
    if pisa_status.err:
        raise RuntimeError(f"PDF generation failed with {pisa_status.err} errors")
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()
