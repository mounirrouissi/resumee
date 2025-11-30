# Name Underline Feature

## Change Summary
Updated the Harvard CV template to display the name/title as **bold, black, and underlined**.

## Implementation

### 1. PDF Formatter (`pdf_formatter.py`)
```python
# Wrap name with underline tag
underlined_content = f'<u>{content}</u>'
para = Paragraph(underlined_content, self.template_styles['name'])
```

### 2. PDF Service Fallback (`pdf_service.py`)
```python
# Add underline tag for the name
underlined_name = f'<u>{line_stripped}</u>'
story.append(Paragraph(underlined_name, name_style))
```

### 3. Documentation Updates
- Updated `harvard_spec.md` to specify underlined name
- Updated `HARVARD_QUICK_REF.md` with visual representation

## Visual Result
```
        JOHN SMITH
        ──────────
City, Country • Phone • Email
```

## Technical Details
- Uses ReportLab's `<u>` tag for underlining
- Underline color: Black (#000000)
- Underline applies to both:
  - Formatted text with [TITLE:] markers
  - Fallback simple text parsing
- Consistent across all rendering paths

## Spec Compliance
✓ Bold: Times-Bold font
✓ Black: #000000 color
✓ Underlined: <u> tag applied
✓ Centered: TA_CENTER alignment
✓ 22pt size: fontSize=21-22
