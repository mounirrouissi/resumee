# Harvard CV Format Requirements - Implementation Status

## What is Harvard CV Format?

The Harvard CV format is a traditional, professional resume format recommended by Harvard Career Services. It emphasizes:
- Clean, academic presentation
- Education-first ordering
- Centered header
- Serif fonts (Times New Roman)
- Clear section divisions
- Quantifiable achievements

## How the App Respects Harvard Format

### ✅ Implemented Features

#### 1. **Font Selection**
- **Requirement**: Times New Roman (serif font)
- **Implementation**: 
  ```python
  fontName='Times-Bold'  # For headings
  fontName='Times-Roman' # For body text
  ```
- **Status**: ✅ Fully implemented in `backend/services/templates.py`

#### 2. **Centered Header**
- **Requirement**: Name and contact info centered at top
- **Implementation**:
  ```python
  alignment=TA_CENTER  # For name and contact styles
  ```
- **Status**: ✅ Fully implemented

#### 3. **Font Sizes**
- **Requirement**: 
  - Name: 14-16pt
  - Body: 10-11pt
- **Implementation**:
  ```python
  'name': fontSize=16
  'contact': fontSize=10
  'body': fontSize=10
  ```
- **Status**: ✅ Fully implemented

#### 4. **Section Dividers**
- **Requirement**: Horizontal lines between sections
- **Implementation**: Detects `─` characters and converts to underscores
- **Status**: ✅ Implemented

#### 5. **Education First**
- **Requirement**: Education section before Experience
- **Implementation**: AI prompt instructs to place EDUCATION first
- **Status**: ✅ Implemented in system prompt

#### 6. **Professional Tone**
- **Requirement**: Academic, professional language
- **Implementation**: AI prompt emphasizes professional tone
- **Status**: ✅ Implemented in system prompt

### 📋 Harvard CV Structure (As Implemented)

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

## Current Limitations (Due to API Key Issue)

### ⚠️ When API Key is Blocked/Missing

The app falls back to "simulation mode" which:
- ❌ Does NOT restructure the resume
- ❌ Does NOT add Harvard formatting
- ❌ Does NOT reorder sections (Education first)
- ❌ Does NOT add quantifiable metrics
- ✅ Only does basic word replacements

**Example of Simulation Mode:**
```
Input:  "Worked on web applications"
Output: "Developed web applications"
```

### ✅ When API Key is Valid

The app provides full Harvard CV transformation:
- ✅ Restructures entire resume
- ✅ Centers header
- ✅ Places Education first
- ✅ Adds section dividers
- ✅ Quantifies achievements
- ✅ Uses strong action verbs
- ✅ Formats in Harvard style

**Example of Full AI Mode:**
```
Input:
JOE SMITH
333-434-2212
Actor

THEATRE
Grease - Danny
Music Man - Marcellus

Output:
                        JOE SMITH
        123 Main Street, City, State 12345
Phone: (333) 434-2212 | Email: joe.smith@email.com

EDUCATION
─────────────────────────────────────────────────────────────
[Education details if provided, otherwise omitted]

EXPERIENCE
─────────────────────────────────────────────────────────────
Actor, Holt Community Theatre, Location              Year - Present
• Performed lead role of Danny in Grease, engaging audiences of 500+ attendees
• Portrayed Marcellus in Music Man, contributing to sold-out performances
• Demonstrated versatility across multiple theatrical genres

SKILLS
─────────────────────────────────────────────────────────────
Performance: Acting, Singing (Tenor), Stage Presence
Physical: Height 6'3", Weight 156lbs, Age Range 22-25
```

## How to Enable Full Harvard CV Format

### Step 1: Get Valid API Key
```
Visit: https://makersuite.google.com/app/apikey
Click: "Create API Key"
Copy: The new key
```

### Step 2: Update .env
```env
GEMINI_API_KEY=YOUR_NEW_KEY_HERE
LLM_MODEL=gemini-2.5-flash
```

### Step 3: Restart Backend
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### Step 4: Verify
Look for in logs:
```
✓ GEMINI_API_KEY loaded: [your key]
✓ LLM_MODEL: gemini-2.5-flash
```

## Verification Checklist

After uploading a resume with valid API key, check:

- [ ] Name is centered at top
- [ ] Contact info is centered below name
- [ ] Font is Times New Roman (serif)
- [ ] Education section appears BEFORE Experience
- [ ] Section headings are in ALL CAPS
- [ ] Horizontal dividers separate sections
- [ ] Bullet points use strong action verbs
- [ ] Achievements include quantifiable metrics
- [ ] Date format is consistent (Month Year)
- [ ] Professional, academic tone throughout

## Technical Implementation

### Template Configuration
File: `backend/services/templates.py`
```python
class ProfessionalTemplate(CVTemplate):
    def __init__(self):
        self.id = "professional"
        self.name = "Harvard CV Format"
        self.description = "Traditional Harvard-style CV..."
```

### PDF Generation
File: `backend/services/pdf_service.py`
- Uses ReportLab library
- Applies template styles
- Detects and formats sections
- Centers header elements
- Applies Times New Roman font

### AI Prompt
File: `backend/services/templates.py`
- 4,169 character detailed prompt
- Specifies Harvard CV structure
- Includes formatting rules
- Provides examples
- Emphasizes ATS optimization

## Troubleshooting

### Issue: PDF doesn't look like Harvard format
**Check:**
1. Is API key valid? (Check logs for "✓ GEMINI_API_KEY loaded")
2. Did AI improvement work? (Check for "✓ Text was successfully improved")
3. Is template set to "professional"? (Check upload request logs)

### Issue: Education not appearing first
**Cause:** Simulation mode is active (API key issue)
**Solution:** Get new API key and restart backend

### Issue: Font looks wrong
**Check:** PDF viewer - some viewers render Times New Roman differently
**Note:** The font IS Times New Roman in the PDF, viewer display may vary

### Issue: No section dividers
**Cause:** AI didn't add them (API key issue) or PDF viewer doesn't show them
**Solution:** Ensure API key is valid for full AI formatting

## Summary

The app **fully implements** Harvard CV format requirements when:
- ✅ Valid API key is configured
- ✅ Backend is running with load_dotenv()
- ✅ Template "professional" is selected
- ✅ AI service successfully processes the resume

The app **partially implements** Harvard CV format when:
- ⚠️ API key is missing/blocked (simulation mode)
- ⚠️ Only basic formatting applied
- ⚠️ No restructuring or Harvard-specific changes

**Current Status:** API key is blocked → Get new key to enable full Harvard CV formatting
