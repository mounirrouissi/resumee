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
        self.name = "Professional"
        self.description = "Clean ATS-optimized layout perfect for corporate roles"
        self.preview_image = "professional_preview.png"
    
    def get_styles(self) -> Dict[str, ParagraphStyle]:
        """Professional template styles - clean and ATS-friendly."""
        from reportlab.lib.styles import getSampleStyleSheet
        
        base_styles = getSampleStyleSheet()
        
        return {
            'name': ParagraphStyle(
                'ATSName',
                parent=base_styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=14,
                textColor=colors.HexColor('#000000'),
                spaceAfter=4,
                alignment=TA_LEFT,
                leading=16
            ),
            'job_title': ParagraphStyle(
                'ATSJobTitle',
                parent=base_styles['Normal'],
                fontName='Helvetica',
                fontSize=12,
                textColor=colors.HexColor('#000000'),
                spaceAfter=4,
                alignment=TA_LEFT
            ),
            'contact': ParagraphStyle(
                'ATSContact',
                parent=base_styles['Normal'],
                fontName='Helvetica',
                fontSize=11,
                textColor=colors.HexColor('#000000'),
                spaceAfter=12,
                alignment=TA_LEFT
            ),
            'section_heading': ParagraphStyle(
                'ATSHeading',
                parent=base_styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=12,
                textColor=colors.HexColor('#000000'),
                spaceAfter=8,
                spaceBefore=12,
                alignment=TA_LEFT,
                leading=14
            ),
            'body': ParagraphStyle(
                'ATSBody',
                parent=base_styles['Normal'],
                fontName='Helvetica',
                fontSize=11,
                textColor=colors.HexColor('#000000'),
                alignment=TA_LEFT,
                spaceAfter=6,
                leading=13
            ),
            'bullet': ParagraphStyle(
                'ATSBullet',
                parent=base_styles['Normal'],
                fontName='Helvetica',
                fontSize=11,
                textColor=colors.HexColor('#000000'),
                alignment=TA_LEFT,
                spaceAfter=4,
                leftIndent=20,
                bulletIndent=10,
                leading=13
            ),
            'divider': ParagraphStyle(
                'ATSDivider',
                parent=base_styles['Normal'],
                fontName='Helvetica',
                fontSize=8,
                textColor=colors.HexColor('#333333'),
                spaceAfter=6,
                spaceBefore=6,
                alignment=TA_LEFT
            ),
        }
    
    def get_system_prompt(self) -> str:
        """System prompt for Professional template."""
        return """You are an expert resume improvement assistant specialized in creating ATS-optimized, professional resumes.

CRITICAL FORMATTING REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATS OPTIMIZATION RULES (MUST FOLLOW):
1. Use ONLY standard fonts: Arial, Calibri, Helvetica, Times New Roman
2. NO photos, graphics, tables, text boxes, icons, or fancy fonts
3. Use simple text formatting with clear section headings
4. Reverse-chronological order (most recent first)
5. Include quantifiable achievements with metrics
6. Use strong action verbs
7. Keep sections clearly separated with visual dividers

RECRUITER PREFERENCES:
• Recruiters spend 6-10 seconds scanning resumes
• Clean layout with clear section headings
• Easy-to-locate information
• Career trajectory must be immediately visible

REQUIRED OUTPUT STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR FULL NAME
Target Job Title
City, Country | Phone | Email | linkedin.com/in/yourprofile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[3-4 sentences: professional identity + years of experience + top achievement with metrics + key skills]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Job Title | Company Name | Location | MM/YYYY - MM/YYYY
• [Action verb] + [what you did] + [result with number]
• [Action verb] + [what you did] + [result with number]
• [Action verb] + [what you did] + [result with number]

Previous Job Title | Company | Location | MM/YYYY - MM/YYYY
• [Achievement bullet with quantified impact]
• [Achievement bullet with quantified impact]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Degree, Major | University Name | Graduation Date

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill 1 | Skill 2 | Skill 3 | Skill 4 | Skill 5 | Skill 6

IMPROVEMENT GUIDELINES:
1. Preserve all factual information (names, dates, companies, education)
2. Use strong action verbs (Led, Developed, Achieved, Increased, etc.)
3. Quantify all achievements with numbers, percentages, or metrics
4. Improve clarity and conciseness
5. Maintain professional tone
6. Optimize for Applicant Tracking Systems (ATS)
7. Remove redundancies and filler words
8. Highlight key accomplishments with measurable impact
9. Use consistent formatting throughout
10. Ensure each bullet starts with an action verb

FORMATTING SPECIFICATIONS:
• Font Size: 10-12pt for body text
• Headings: 12-14pt, bold
• Margins: 0.5-1 inch
• Use pipe separators (|) not slashes or commas
• Section dividers: Use the exact line pattern shown above
• Date format: MM/YYYY - MM/YYYY or MM/YYYY - Present

WHAT TO AVOID:
❌ Photos or headshots
❌ Graphics, charts, or icons
❌ Tables or text boxes
❌ Multiple columns (complex layouts)
❌ Fancy fonts or colors
❌ Weak verbs (helped, worked on, responsible for)
❌ Vague statements without metrics
❌ Personal pronouns (I, me, my)
❌ Abbreviations without context

Return ONLY the improved resume text following the EXACT structure above with section dividers."""


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
