"""
CV Template definitions and formatting logic.
Each template defines the structure and styling for generated CVs.
"""

from typing import Dict, List
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors

class CVTemplate:
    """Base class for CV templates."""
    
    def __init__(self):
        self.id: str = ""
        self.name: str = ""
        self.description: str = ""
        self.preview_image: str = ""
    
    def get_styles(self) -> Dict[str, ParagraphStyle]:
        """Return the paragraph styles for this template."""
        raise NotImplementedError
    
    def get_system_prompt(self) -> str:
        """Return the AI system prompt for this template."""
        raise NotImplementedError


class ProfessionalTemplate(CVTemplate):
    """
    Professional ATS-optimized template.
    Clean, simple layout with clear sections and dividers.
    Best for: Corporate jobs, traditional industries, ATS systems.
    """
    
    def __init__(self):
        super().__init__()
        self.id = "professional"
        self.name = "Harvard CV Format"
        self.description = "Traditional Harvard-style CV with centered header, perfect for academic and professional roles"
        self.preview_image = "professional_preview.png"
    
    def get_styles(self) -> Dict[str, ParagraphStyle]:
        """Professional template styles - Harvard CV Format."""
        from reportlab.lib.styles import getSampleStyleSheet
        
        base_styles = getSampleStyleSheet()
        
        return {
            'name': ParagraphStyle(
                'HarvardName',
                parent=base_styles['Normal'],
                fontName='Times-Bold',
                fontSize=16,
                textColor=colors.HexColor('#000000'),
                spaceAfter=2,
                alignment=TA_CENTER,
                leading=18
            ),
            'job_title': ParagraphStyle(
                'HarvardJobTitle',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=11,
                textColor=colors.HexColor('#000000'),
                spaceAfter=2,
                alignment=TA_CENTER
            ),
            'contact': ParagraphStyle(
                'HarvardContact',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,
                textColor=colors.HexColor('#000000'),
                spaceAfter=12,
                alignment=TA_CENTER
            ),
            'section_heading': ParagraphStyle(
                'HarvardHeading',
                parent=base_styles['Normal'],
                fontName='Times-Bold',
                fontSize=11,
                textColor=colors.HexColor('#000000'),
                spaceAfter=4,
                spaceBefore=10,
                alignment=TA_LEFT,
                leading=13
            ),
            'body': ParagraphStyle(
                'HarvardBody',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,
                textColor=colors.HexColor('#000000'),
                alignment=TA_LEFT,
                spaceAfter=4,
                leading=12
            ),
            'bullet': ParagraphStyle(
                'HarvardBullet',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,
                textColor=colors.HexColor('#000000'),
                alignment=TA_LEFT,
                spaceAfter=3,
                leftIndent=20,
                bulletIndent=10,
                leading=12
            ),
            'divider': ParagraphStyle(
                'HarvardDivider',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,
                textColor=colors.HexColor('#000000'),
                spaceAfter=4,
                spaceBefore=2,
                alignment=TA_LEFT
            ),
        }
    
    def get_system_prompt(self) -> str:
        """System prompt for Professional template - Harvard CV Format."""
        return """You are an expert resume improvement assistant specialized in creating Harvard-style CVs that are ATS-optimized and professionally formatted.

HARVARD CV FORMAT REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMATTING RULES:
1. Use ONLY standard fonts: Times New Roman, Garamond, or similar serif fonts
2. Clean, traditional layout with clear section headings
3. Reverse-chronological order (most recent first)
4. NO photos, graphics, tables, or fancy formatting
5. Use consistent spacing and alignment
6. Professional, academic tone

HARVARD CV STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR FULL NAME
Street Address, City, State ZIP Code
Phone: (XXX) XXX-XXXX | Email: your.email@example.com | LinkedIn: linkedin.com/in/yourprofile

EDUCATION
─────────────────────────────────────────────────────────────
University Name, Location
Degree, Major (GPA: X.XX/4.00)                                                    Month Year - Month Year
• Relevant coursework: Course 1, Course 2, Course 3
• Honors/Awards: Dean's List, Scholarship Name
• Activities: Club Name, Organization Name

Previous Institution, Location
Degree/Certificate                                                                 Month Year - Month Year

EXPERIENCE
─────────────────────────────────────────────────────────────
Job Title, Company Name, Location                                                  Month Year - Month Year
• Action verb describing responsibility or achievement with quantifiable results
• Action verb describing responsibility or achievement with quantifiable results
• Action verb describing responsibility or achievement with quantifiable results
• Focus on impact, metrics, and outcomes

Previous Job Title, Company Name, Location                                         Month Year - Month Year
• Achievement with specific metrics and results
• Achievement with specific metrics and results

SKILLS
─────────────────────────────────────────────────────────────
Technical: Skill 1, Skill 2, Skill 3, Skill 4, Skill 5
Languages: Language 1 (Proficiency), Language 2 (Proficiency)
Certifications: Certification Name (Year), Certification Name (Year)

ADDITIONAL SECTIONS (if applicable):
─────────────────────────────────────────────────────────────
LEADERSHIP & ACTIVITIES
Organization Name, Role                                                            Month Year - Month Year
• Description of leadership role and impact

PUBLICATIONS & RESEARCH (if applicable)
• Author(s). "Title of Publication." Journal/Conference Name, Year.

AWARDS & HONORS (if applicable)
• Award Name, Issuing Organization, Year

HARVARD CV BEST PRACTICES:
1. Name should be prominent at the top (14-16pt)
2. Contact information directly below name (10-11pt)
3. Education comes FIRST (especially for recent graduates)
4. Use consistent date alignment (right-aligned)
5. Section headings in ALL CAPS or bold
6. Use simple horizontal lines (─) as section dividers
7. Bullet points for all descriptions
8. Quantify achievements with numbers, percentages, dollar amounts
9. Strong action verbs: Led, Developed, Managed, Achieved, Increased, etc.
10. Keep to 1 page for early career, 2 pages maximum for experienced professionals

CONTENT GUIDELINES:
• Be specific and quantifiable (increased sales by 25%, managed team of 10)
• Focus on achievements, not just responsibilities
• Use past tense for previous roles, present tense for current role
• Tailor content to target position
• Remove personal pronouns (I, me, my)
• Avoid abbreviations without context
• Use consistent formatting throughout

DATE FORMAT:
• Use: January 2023 - Present OR Jan 2023 - Present
• Use: September 2020 - May 2024
• Be consistent throughout the document

WHAT TO AVOID:
❌ Objective statements (outdated)
❌ Photos or headshots
❌ Graphics, charts, or icons
❌ Multiple columns
❌ Fancy fonts or colors
❌ Weak verbs (helped, worked on, responsible for)
❌ Vague statements without metrics
❌ Personal information (age, marital status, etc.)
❌ References (provide separately when requested)

Return ONLY the improved CV text following the EXACT Harvard format structure above."""


# Template registry
TEMPLATES: Dict[str, CVTemplate] = {
    "professional": ProfessionalTemplate(),
}


def get_template(template_id: str) -> CVTemplate:
    """Get a template by ID."""
    if template_id not in TEMPLATES:
        raise ValueError(f"Template '{template_id}' not found")
    return TEMPLATES[template_id]


def list_templates() -> List[Dict[str, str]]:
    """List all available templates."""
    return [
        {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "preview_image": template.preview_image,
        }
        for template in TEMPLATES.values()
    ]
