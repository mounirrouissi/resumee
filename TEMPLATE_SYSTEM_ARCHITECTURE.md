# Template System Architecture

## Overview
The template system ensures each CV template follows its specific design specifications for professional, ATS-optimized output.

## Directory Structure
```
backend/services/
├── templates.py              # Template definitions and styles
├── template_specs/           # Specification documents
│   └── harvard_spec.md      # Harvard CV specifications
├── pdf_formatter.py          # Parses markers and generates PDFs
└── pdf_service.py            # OCR and PDF generation orchestration
```

## How It Works

### 1. Template Definition (`templates.py`)
Each template class defines:
- **ID**: Unique identifier (e.g., "professional")
- **Name**: Display name (e.g., "Harvard CV Format")
- **Description**: User-facing description
- **Styles**: ReportLab ParagraphStyle objects following spec
- **System Prompt**: AI instructions for content formatting

### 2. Specification File (`template_specs/`)
Each template has a markdown spec defining:
- Page layout (size, margins, columns)
- Typography (fonts, sizes, spacing)
- Section order and formatting
- Content rules (tense, bullets, quantification)
- ATS best practices
- Visual styling (colors, dividers, whitespace)

### 3. PDF Generation Flow
```
User uploads PDF
    ↓
OCR extracts text
    ↓
AI improves text with template-specific prompt
    ↓
AI adds formatting markers ([TITLE:], [SECTION:], etc.)
    ↓
PDFFormatter parses markers
    ↓
Generate PDF with template styles
    ↓
Output follows template spec exactly
```

## Harvard Template Specifications

### Page Layout
- **Size**: US Letter (8.5 × 11 in)
- **Margins**: 0.75 inch (19mm) all around
- **Columns**: Single column
- **Length**: 1-2 pages

### Typography
- **Font**: Times New Roman (serif)
- **Name**: 22pt bold, centered
- **Contact**: 10pt regular, centered
- **Section headers**: 12pt bold, ALL CAPS
- **Body**: 10pt regular
- **Line spacing**: 1.2

### Structure
1. Name (centered, 22pt bold)
2. Contact info (centered, 10pt, with • separators)
3. EDUCATION (with horizontal rule)
4. EXPERIENCE (with horizontal rule)
5. SKILLS (with horizontal rule)
6. PERSONAL INFORMATION (optional)

### Formatting Rules
- **Dates**: Right-aligned, consistent format
- **Bullets**: 3-6 per role, action verbs, quantified
- **Spacing**: 6-8pt between sections
- **Dividers**: 1px horizontal line under section headers

## Adding New Templates

### Step 1: Create Spec File
```markdown
# [Template Name] Specification
## Overall Layout
- Page size: ...
- Margins: ...
## Typography
- Fonts: ...
- Sizes: ...
```

### Step 2: Define Template Class
```python
class NewTemplate(CVTemplate):
    def __init__(self):
        self.id = "template_id"
        self.name = "Display Name"
        self.description = "Description"
    
    def get_styles(self):
        return {
            'name': ParagraphStyle(...),
            'section_heading': ParagraphStyle(...),
            # ... more styles
        }
    
    def get_system_prompt(self):
        return """AI instructions..."""
```

### Step 3: Register Template
```python
TEMPLATES = {
    "template_id": NewTemplate(),
}
```

## Style Consistency

All templates must define these styles:
- `name` - Main name/title
- `contact` - Contact information
- `section_heading` - Major section headers
- `body` - Regular body text
- `bullet` - Bullet points
- `divider` - Section dividers

## ATS Optimization

All templates follow ATS best practices:
- Standard section headings
- Single column layout
- No text in shapes/boxes
- Selectable text (not images)
- Standard fonts
- Simple structure
- Keyword-friendly

## Quality Assurance

Before releasing a template:
1. ✓ Spec file created and reviewed
2. ✓ Styles match spec exactly
3. ✓ AI prompt generates correct markers
4. ✓ PDF output matches spec
5. ✓ ATS parsing tested
6. ✓ Preview generated
7. ✓ Mobile/web display tested
