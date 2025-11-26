# Harvard CV Formatting Requirements

## Visual Guide: How Sections and Bullets Should Look

### ✅ **Correct Formatting**

```
                    JOHN SMITH
        123 Main Street, Boston, MA 02101
    Phone: (555) 123-4567 | Email: john.smith@email.com

EDUCATION
─────────────────────────────────────────────────────
Massachusetts Institute of Technology, Cambridge, MA
Bachelor of Science in Computer Science (GPA: 3.8/4.0)    Sep 2016 - May 2020
• Relevant coursework: Data Structures, Algorithms, Machine Learning
• Dean's List: Fall 2018, Spring 2019, Fall 2019
• Activities: Computer Science Club President

EXPERIENCE
─────────────────────────────────────────────────────
Software Engineer, Tech Company Inc., Boston, MA          June 2020 - Present
• Developed and deployed 5 full-stack web applications using React and Node.js
• Optimized database queries reducing load time by 40%
• Led cross-functional team of 8 developers

SKILLS
─────────────────────────────────────────────────────
Technical: JavaScript, Python, React, Node.js, PostgreSQL
Languages: English (Native), Spanish (Conversational)
```

### ❌ **Incorrect Formatting**

```
JOHN SMITH (not centered)
john.smith@email.com (not centered)

Education (not bold, not all caps)
MIT
• Coursework: Data Structures (bullet not aligned)
  • Dean's List (inconsistent indentation)

Experience (not bold)
Software Engineer
•Developed applications (no space after bullet)
  • Optimized queries (wrong indentation)
```

---

## 📋 **Formatting Rules**

### 1. **Section Titles (EDUCATION, EXPERIENCE, SKILLS)**

**Requirements:**
- ✅ MUST be in ALL CAPS
- ✅ MUST be in BOLD font
- ✅ Should have horizontal line underneath
- ✅ Proper spacing before and after

**Implementation:**
```
[SECTION: EDUCATION]  → Renders as: EDUCATION (bold, all caps, underlined)
[SECTION: EXPERIENCE] → Renders as: EXPERIENCE (bold, all caps, underlined)
[SECTION: SKILLS]     → Renders as: SKILLS (bold, all caps, underlined)
```

**PDF Styling:**
- Font: Times-Bold
- Size: 11pt
- Alignment: Left
- Space before: 10pt
- Space after: 4pt
- Underline: Yes (horizontal line)

### 2. **Bullet Points**

**Requirements:**
- ✅ MUST use • character (bullet point)
- ✅ MUST have consistent indentation (20pt from left)
- ✅ MUST have space between bullet and text
- ✅ Text should align properly, not overlap bullet
- ✅ All bullets in same section should align perfectly

**Implementation:**
```
[BULLET: Developed applications...]
[BULLET: Optimized database queries...]
[BULLET: Led team of developers...]
```

**PDF Styling:**
- Font: Times-Roman
- Size: 10pt
- Left indent: 20pt (bullet position)
- Bullet indent: 10pt (text starts here)
- Space after: 3pt
- Leading: 12pt (line height)

**Visual Alignment:**
```
•  Developed and deployed 5 full-stack web applications
   using React and Node.js, serving 10,000+ users
•  Optimized database queries reducing load time by 40%
   and improving overall system performance
•  Led cross-functional team of 8 developers to deliver
   project 2 months ahead of schedule
```

### 3. **Header (Name & Contact)**

**Requirements:**
- ✅ Name MUST be centered
- ✅ Name MUST be larger (16pt)
- ✅ Name MUST be bold
- ✅ Contact info MUST be centered
- ✅ Contact info smaller (10pt)

**Implementation:**
```
[TITLE: JOHN SMITH]
[CONTACT: 123 Main Street, Boston, MA 02101]
[CONTACT: Phone: (555) 123-4567]
[CONTACT: Email: john.smith@email.com]
```

### 4. **Subsections (Job Titles, Companies)**

**Requirements:**
- ✅ Should be bold
- ✅ Left-aligned
- ✅ Proper spacing

**Implementation:**
```
[SUBSECTION: Software Engineer, Tech Company Inc., Boston, MA]
[DATE: June 2020 - Present]
```

---

## 🎨 **Complete Example with Proper Formatting**

### Input (with markers):
```
[TITLE: SARAH JOHNSON]
[CONTACT: 456 Oak Avenue, San Francisco, CA 94102]
[CONTACT: Phone: (555) 987-6543]
[CONTACT: Email: sarah.johnson@email.com]
[SPACING]
[SECTION: EDUCATION]
[SUBSECTION: Stanford University, Stanford, CA]
[SUBSECTION: Master of Business Administration (MBA)]
[DATE: September 2018 - June 2020]
[BULLET: Concentration in Marketing and Entrepreneurship]
[BULLET: GPA: 3.9/4.0, Dean's List all semesters]
[SPACING]
[SECTION: EXPERIENCE]
[SUBSECTION: Senior Marketing Manager, Digital Corp, San Francisco, CA]
[DATE: March 2020 - Present]
[BULLET: Led digital marketing strategy resulting in 150% increase in qualified leads]
[BULLET: Managed cross-functional team of 8 marketing specialists]
[BULLET: Developed social media campaigns reaching 2M+ users with 45% engagement rate]
[SPACING]
[SECTION: SKILLS]
[PARAGRAPH]
[BOLD: Technical:] Google Analytics, HubSpot, Salesforce, Adobe Creative Suite
[BOLD: Marketing:] Digital Strategy, Content Marketing, SEO/SEM, Social Media
```

### Output (PDF rendering):
```
                    SARAH JOHNSON
            456 Oak Avenue, San Francisco, CA 94102
        Phone: (555) 987-6543 | Email: sarah.johnson@email.com

EDUCATION
─────────────────────────────────────────────────────────────
Stanford University, Stanford, CA
Master of Business Administration (MBA)
September 2018 - June 2020
• Concentration in Marketing and Entrepreneurship
• GPA: 3.9/4.0, Dean's List all semesters

EXPERIENCE
─────────────────────────────────────────────────────────────
Senior Marketing Manager, Digital Corp, San Francisco, CA
March 2020 - Present
• Led digital marketing strategy resulting in 150% increase in qualified leads
• Managed cross-functional team of 8 marketing specialists
• Developed social media campaigns reaching 2M+ users with 45% engagement rate

SKILLS
─────────────────────────────────────────────────────────────
Technical: Google Analytics, HubSpot, Salesforce, Adobe Creative Suite
Marketing: Digital Strategy, Content Marketing, SEO/SEM, Social Media
```

---

## 🔍 **Quality Checklist**

When reviewing the generated PDF, verify:

### Section Titles:
- [ ] All section titles are in BOLD
- [ ] All section titles are in ALL CAPS
- [ ] Horizontal line appears under each section title
- [ ] Consistent spacing before and after

### Bullet Points:
- [ ] All bullets use • character
- [ ] All bullets are aligned vertically
- [ ] Proper space between bullet and text
- [ ] Text doesn't overlap with bullet
- [ ] Multi-line bullets have proper hanging indent
- [ ] Consistent spacing between bullets

### Header:
- [ ] Name is centered
- [ ] Name is bold and larger
- [ ] Contact info is centered
- [ ] Contact info is smaller than name

### Overall:
- [ ] Times New Roman font throughout
- [ ] Consistent spacing
- [ ] Professional appearance
- [ ] Clean, readable layout

---

## 🛠️ **Technical Implementation**

### Section Heading Style:
```python
'section_heading': ParagraphStyle(
    'HarvardHeading',
    fontName='Times-Bold',      # ← BOLD font
    fontSize=11,
    alignment=TA_LEFT,
    spaceBefore=10,
    spaceAfter=4,
)
```

### Bullet Style:
```python
'bullet': ParagraphStyle(
    'HarvardBullet',
    fontName='Times-Roman',
    fontSize=10,
    leftIndent=20,              # ← Bullet position
    bulletIndent=10,            # ← Text starts here
    spaceAfter=3,
    leading=12,                 # ← Line height
)
```

### Rendering:
```python
# Section headers rendered with bold style
para = Paragraph(content.upper(), self.template_styles['section_heading'])

# Bullets rendered with proper indentation
para = Paragraph(f'• {content}', self.template_styles['bullet'])
```

---

## ✅ **Summary**

The system is configured to:
1. ✅ Render section titles in BOLD ALL CAPS
2. ✅ Add horizontal lines under sections
3. ✅ Properly align all bullet points
4. ✅ Use consistent indentation (20pt)
5. ✅ Apply professional spacing
6. ✅ Use Times New Roman font
7. ✅ Follow Harvard CV format standards

**All formatting requirements are implemented and will be applied automatically when the AI uses the correct markers!**
