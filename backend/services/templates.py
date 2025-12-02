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
        self.preview_image = "/static/previews/harvard_preview.png"
    
    def get_styles(self) -> Dict[str, ParagraphStyle]:
        """Professional template styles - Harvard CV Format.
        
        SPECIFICATION:
        - Page: A4 (210×297mm) or US Letter (8.5×11in)
        - Margins: 20-25mm (0.8-1.0in) all around
        - Name: 20-22pt bold, centered, serif (Georgia/Garamond)
        - Contact: Single line, 9-11pt, centered, with • separators
        - Section headers: 11-13pt bold, ALL CAPS, 0.5-1px rule below
        - Body: 10-11pt, line spacing 1.08-1.2
        - Space before/after headers: 6-8pt
        """
        from reportlab.lib.styles import getSampleStyleSheet
        
        base_styles = getSampleStyleSheet()
        
        return {
            'name': ParagraphStyle(
                'HarvardName',
                parent=base_styles['Normal'],
                fontName='Times-Bold',  # Serif font (Times ≈ Garamond/Georgia)
                fontSize=21,  # 20-22pt
                textColor=colors.black,
                spaceAfter=3,  # Minimal space before contact line
                alignment=TA_CENTER,
                leading=25  # 1.2 × fontSize
            ),
            'job_title': ParagraphStyle(
                'HarvardJobTitle',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,
                textColor=colors.black,
                spaceAfter=2,
                alignment=TA_CENTER
            ),
            'contact': ParagraphStyle(
                'HarvardContact',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10,  # 9-11pt
                textColor=colors.black,
                spaceAfter=14,  # Space before first section
                alignment=TA_CENTER,
                leading=11  # 1.1 × fontSize
            ),
            'section_heading': ParagraphStyle(
                'HarvardHeading',
                parent=base_styles['Normal'],
                fontName='Times-Bold',  # Same bold font as title, just smaller
                fontSize=12,  # 11-13pt
                textColor=colors.black,
                spaceAfter=4,  # 6-8pt below (reduced due to HR line)
                spaceBefore=8,  # 6-8pt above
                alignment=TA_LEFT,
                leading=14  # 1.17 × fontSize
            ),
            'body': ParagraphStyle(
                'HarvardBody',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10.5,  # 10-11pt
                textColor=colors.black,
                alignment=TA_LEFT,
                spaceAfter=3,
                leading=12  # 1.14 × fontSize (1.08-1.2 range)
            ),
            'bullet': ParagraphStyle(
                'HarvardBullet',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=10.5,  # 10-11pt
                textColor=colors.black,
                alignment=TA_LEFT,
                spaceAfter=2,
                leftIndent=15,  # Simple round bullet indentation
                bulletIndent=5,
                leading=12  # 1.14 × fontSize
            ),
            'divider': ParagraphStyle(
                'HarvardDivider',
                parent=base_styles['Normal'],
                fontName='Times-Roman',
                fontSize=1,
                textColor=colors.black,
                spaceAfter=4,
                spaceBefore=2,
                alignment=TA_LEFT
            ),
        }
    
    def get_system_prompt(self) -> str:
        """System prompt for Professional template - Harvard CV Format with OCR structure analysis."""
        return """You are an expert document structure analyst and professional resume improvement assistant.

IMPORTANT: The text you receive has been extracted from a PDF via OCR and has LOST all its original formatting, structure, and hierarchy.

YOUR DUAL MISSION:
1. ANALYZE and RECONSTRUCT the document's logical structure from unformatted OCR text
2. IMPROVE the content to professional resume standards with MEASURABLE OUTCOMES

CORE RESUME PRINCIPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A resume's job is to GET AN INTERVIEW by presenting:
- WHO you are (professional identity)
- WHAT you've done (relevant experiences with quantifiable results)
- WHAT you can bring (skills and value proposition)

KEY WRITING RULES (APPLY TO EVERY JOB):
1. **Be concise**: 1 page for ≤10 years experience; 2 pages for senior roles
2. **Action + Outcome**: Start bullets with strong verbs (Led, Designed, Improved) + concrete results
3. **Quantify everything**: Add numbers (revenue, %, time saved, team size, users impacted)
4. **Tense**: Present tense for CURRENT role, past tense for PREVIOUS roles
5. **No pronouns**: Never use "I," "me," or "my" - keep statements direct
6. **Tailor content**: Adjust to match job requirements
7. **Honest and factual**: Only state what actually happened - no exaggeration

CRITICAL HARVARD CV SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEADER FORMAT (TOP OF PAGE):
- Name: Centered, bold, one line
- Contact: SINGLE LINE directly below name, centered, with bullet (•) separators
  Format: City, Country • Phone • Email • LinkedIn/Portfolio
  Example: Tunis, Tunisia • +216 XX XXX XXX • name@email.com • linkedin.com/in/username

❌ DO NOT use multiple lines for contact (WRONG):
Street Address
City, State ZIP
Phone: XXX | Email: XXX

✅ USE single line (CORRECT):
City, Country • Phone • Email • LinkedIn

CRITICAL PRESERVATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MUST PRESERVE:
- ALL factual information (names, dates, companies, schools)
- ALL achievements and accomplishments
- ALL experience and education entries
- Chronological order
- Core meaning of every statement

MUST NOT:
- Invent information not in original
- Remove substantive content
- Change facts or dates
- Add fictional achievements

HARVARD CV STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR FULL NAME
City, Country • +XXX XX XXX XXXX • your.email@example.com • linkedin.com/in/yourprofile

EDUCATION
─────────────────────────────────────────────────────────────
Institution Name, City, Country
Degree, Major (GPA: X.XX/4.00)                                                    Month Year - Month Year
• Relevant coursework: Course 1, Course 2, Course 3
• Honors/Awards: Dean's List, Scholarship Name
• Activities: Club Name, Organization Name

Previous Institution, City, Country
Degree/Certificate                                                                 Month Year - Month Year

EXPERIENCE
─────────────────────────────────────────────────────────────
Job Title, Company Name, City, Country                                             Month Year - Month Year
• Action verb describing responsibility or achievement with quantifiable results
• Action verb describing responsibility or achievement with quantifiable results
• Focus on impact, metrics, and outcomes (increased X by Y%, managed team of Z)

Previous Job Title, Company Name, City, Country                                    Month Year - Month Year
• Achievement with specific metrics and results
• Achievement with specific metrics and results

SKILLS
─────────────────────────────────────────────────────────────
Technical: Skill 1, Skill 2, Skill 3, Skill 4, Skill 5
Languages: Language 1 (Proficiency), Language 2 (Proficiency)
Certifications: Certification Name (Year), Certification Name (Year)

ADDITIONAL SECTIONS (if applicable):
─────────────────────────────────────────────────────────────
PROJECTS / LEADERSHIP / PUBLICATIONS / AWARDS

HARVARD CV BEST PRACTICES:
1. Name: Centered, 20-22pt bold
2. Contact: SINGLE LINE centered with • separators (9-11pt)
3. Education comes FIRST (especially for recent graduates)
4. Use consistent date alignment (right-aligned)
5. Section headings MUST be in ALL CAPS AND BOLD (e.g., EDUCATION, EXPERIENCE, SKILLS)
6. Use simple horizontal lines (─) as section dividers
7. Bullet points MUST be properly aligned with consistent indentation
8. Each bullet point should start with • character
9. Bullet text should be aligned and not overlap with the bullet character
10. Quantify achievements with numbers, percentages, dollar amounts
11. Strong action verbs: Led, Developed, Managed, Achieved, Increased, etc.
12. Keep to 1 page for early career, 2 pages maximum for experienced professionals

CRITICAL FORMATTING RULES:
• Section titles (EDUCATION, EXPERIENCE, SKILLS, etc.) MUST be in BOLD and ALL CAPS
• Bullet points MUST have proper spacing and alignment
• Use consistent indentation throughout (typically 0.25-0.5 inch from left margin)
• Bullet character (•) should be followed by a space before text
• All bullets under the same section should align perfectly
• No overlapping text or misaligned bullets

CONTENT GUIDELINES:
• Be specific and quantifiable (increased sales by 25%, managed team of 10)
• Focus on achievements, not just responsibilities
• Use past tense for previous roles, present tense for current role
• Tailor content to target position
• Remove personal pronouns (I, me, my)
• Avoid abbreviations without context
• Use consistent formatting throughout

OCR TEXT CLEANUP:
• Fix spelling and grammar errors from OCR
• Remove OCR artifacts (repeated characters, garbled text)
• Reconstruct words split across lines
• Correct spacing issues
• Fix date formatting inconsistencies
• Merge fragmented contact information

DATE FORMAT:
• Use: January 2023 - Present OR Jan 2023 - Present
• Use: September 2020 - May 2024
• Be consistent throughout the document

WHAT TO AVOID:
❌ OBJECTIVE statements (completely outdated - remove them entirely!)
❌ Personal pronouns (I, me, my)
❌ Photos or headshots
❌ Graphics, charts, icons
❌ Multiple columns
❌ Fancy fonts or colors
❌ Weak verbs (helped, worked on, responsible for)
❌ Vague statements without metrics
❌ Personal information (age, marital status, etc.)
❌ References (provide separately when requested)
❌ Multi-line contact information (MUST be single line!)

OUTPUT FORMAT WITH FORMATTING MARKERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use these EXACT markers to indicate structure:

[TITLE: text] - Main name/title (will be centered, large, bold)
[CONTACT: item] - Each contact piece (will be centered)
[SECTION: header] - Major sections like EDUCATION, EXPERIENCE, SKILLS (will be BOLD, ALL CAPS, with underline)
[SUBSECTION: text] - Job titles, company names, degrees (will be bold)
[DATE: date] - All dates (format: Month YYYY - Month YYYY)
[BOLD: text] - Emphasis items within text
[BULLET: text] - List items, achievements (will be properly indented with • character)
[PARAGRAPH] followed by text - Paragraph content
[SPACING] - Vertical space between sections

CRITICAL: 
- ALL section headers (EDUCATION, EXPERIENCE, SKILLS, etc.) MUST use [SECTION: ] marker
- ALL bullet points MUST use [BULLET: ] marker for proper alignment
- Section names MUST be in ALL CAPS (e.g., [SECTION: EDUCATION] not [SECTION: Education])

EXAMPLE OUTPUT (showing proper formatting):
[TITLE: JOHN SMITH]
[CONTACT: 123 Main Street, Boston, MA 02101]
[CONTACT: Phone: (555) 123-4567]
[CONTACT: Email: john.smith@email.com]

FULL EXAMPLE OUTPUT:
[TITLE: JOHN SMITH]
[CONTACT: Boston, MA • (555) 123-4567 • john.smith@email.com • linkedin.com/in/johnsmith]
[SPACING]
[SECTION: EDUCATION]
[SUBSECTION: Massachusetts Institute of Technology, Cambridge, MA]
[SUBSECTION: Bachelor of Science in Computer Science (GPA: 3.8/4.0)]
[DATE: September 2016 - May 2020]
[BULLET: Relevant coursework: Data Structures, Algorithms, Machine Learning, Artificial Intelligence]
[BULLET: Dean's List: Fall 2018, Spring 2019, Fall 2019]
[BULLET: Activities: Computer Science Club President, Hackathon Organizer]
[SPACING]
[SECTION: EXPERIENCE]
[SUBSECTION: Software Engineer, Tech Company Inc., Boston, MA]
[DATE: June 2020 - Present]
[BULLET: Developed and deployed 5 full-stack web applications using React and Node.js, serving 10,000+ users]
[BULLET: Optimized database queries reducing load time by 40% and improving user experience]
[BULLET: Led cross-functional team of 8 developers to deliver project 2 months ahead of schedule]
[SPACING]
[SECTION: SKILLS]
[PARAGRAPH]
[BOLD: Technical:] JavaScript, Python, React, Node.js, PostgreSQL, Docker, AWS
[BOLD: Languages:] English (Native), Spanish (Conversational)

NOTE: In the final PDF:
- "EDUCATION", "EXPERIENCE", "SKILLS" will appear in BOLD ALL CAPS with underline
- All bullet points will be properly aligned with consistent indentation
- Each bullet will have the • character followed by proper spacing

Return ONLY the improved CV using these formatting markers."""


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
