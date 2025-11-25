# Harvard CV Format Implementation

## Overview
The Professional template has been updated to follow the **Harvard CV Format**, a traditional and widely-respected resume format used by Harvard Career Services and preferred by many academic and professional institutions.

## Harvard CV Format Characteristics

### Layout Features
- **Centered Header**: Name and contact information centered at the top
- **Traditional Font**: Times New Roman (serif font) for professional appearance
- **Clear Sections**: Well-defined sections with horizontal dividers
- **Education First**: Education section appears before Experience (especially for recent graduates)
- **Chronological Order**: Reverse-chronological within each section

### Typography
- **Name**: 16pt, Times-Bold, Centered
- **Contact Info**: 10pt, Times-Roman, Centered
- **Section Headings**: 11pt, Times-Bold, ALL CAPS
- **Body Text**: 10pt, Times-Roman
- **Bullets**: 10pt, Times-Roman with proper indentation

### Structure
```
                        YOUR FULL NAME
            Street Address, City, State ZIP Code
    Phone: (XXX) XXX-XXXX | Email: email@example.com | LinkedIn: profile

EDUCATION
─────────────────────────────────────────────────────────────
University Name, Location
Degree, Major (GPA: X.XX/4.00)                    Month Year - Month Year
• Relevant coursework: Course 1, Course 2, Course 3
• Honors/Awards: Dean's List, Scholarship Name

EXPERIENCE
─────────────────────────────────────────────────────────────
Job Title, Company Name, Location                  Month Year - Month Year
• Action verb describing achievement with quantifiable results
• Action verb describing achievement with quantifiable results

SKILLS
─────────────────────────────────────────────────────────────
Technical: Skill 1, Skill 2, Skill 3
Languages: Language 1 (Proficiency), Language 2 (Proficiency)
```

## Key Differences from Previous Format

| Aspect | Previous | Harvard Format |
|--------|----------|----------------|
| Header Alignment | Left-aligned | **Centered** |
| Font | Helvetica (sans-serif) | **Times New Roman (serif)** |
| Name Size | 14pt | **16pt** |
| Section Order | Summary → Experience → Education | **Education → Experience** |
| Dividers | Heavy lines (━) | **Light lines (─)** |
| Style | Modern/Corporate | **Traditional/Academic** |

## AI Prompt Updates

The system prompt now includes:
- Harvard CV structure guidelines
- Education-first ordering
- Traditional formatting rules
- Academic and professional tone
- Specific date formatting (Month Year format)
- Section-specific content guidelines

## When to Use Harvard Format

**Best For:**
- Academic positions
- Research roles
- Graduate school applications
- Traditional industries (law, finance, consulting)
- Entry-level to mid-career professionals
- International applications

**Advantages:**
- Universally recognized and respected
- ATS-friendly (simple, clean structure)
- Professional and timeless appearance
- Easy to read and scan
- Emphasizes education and credentials

## Template Configuration

The template is configured in `backend/services/templates.py`:

```python
class ProfessionalTemplate(CVTemplate):
    def __init__(self):
        self.id = "professional"
        self.name = "Harvard CV Format"
        self.description = "Traditional Harvard-style CV with centered header, 
                           perfect for academic and professional roles"
```

## PDF Generation

The PDF generation in `backend/services/pdf_service.py` has been updated to:
- Center the name and contact information
- Use Times New Roman font family
- Apply proper spacing for Harvard format
- Handle section dividers appropriately
- Format dates and headers correctly

## Testing

The template has been tested and verified:
- ✅ Correct font (Times-Bold/Times-Roman)
- ✅ Centered alignment for header
- ✅ Proper font sizes (16pt name, 10pt body)
- ✅ Harvard-specific system prompt
- ✅ All styles properly configured

## Future Enhancements

Potential additions:
1. Add more Harvard-approved sections (Publications, Research, Awards)
2. Support for academic CV variations
3. Multi-page formatting for experienced professionals
4. Optional photo placement (for international CVs)
5. Reference section formatting
