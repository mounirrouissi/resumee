# CV Template System Implementation

## Overview
Added a template selection feature that allows users to choose from different CV formats. Currently includes one template (Professional), with the architecture ready to support multiple templates.

## Changes Made

### Backend Changes

#### 1. New File: `backend/services/templates.py`
- Created a template system with base `CVTemplate` class
- Implemented `ProfessionalTemplate` with:
  - ATS-optimized styling
  - Custom paragraph styles for different sections
  - Template-specific AI system prompt
- Template registry for easy management
- Helper functions: `get_template()` and `list_templates()`

#### 2. Updated: `backend/main.py`
- Added new endpoint: `GET /api/templates` - Returns list of available templates
- Modified `POST /api/upload-resume` to accept `template_id` parameter (defaults to "professional")
- Passes template_id to AI and PDF generation services

#### 3. Updated: `backend/services/ai_service.py`
- Modified `improve_resume_text()` to accept `template_id` parameter
- Uses template-specific system prompt for AI generation
- Imports and uses template system

#### 4. Updated: `backend/services/pdf_service.py`
- Modified `generate_improved_pdf()` to accept `template_id` parameter
- Uses template-specific styles for PDF generation
- Dynamically loads styles from selected template

### Frontend Changes

#### 1. Updated: `services/resumeApi.ts`
- Added `CVTemplate` interface
- Added `TemplatesResponse` interface
- New method: `getTemplates()` - Fetches available templates from backend
- Modified `uploadResume()` to accept and send `templateId` parameter

#### 2. Updated: `screens/UploadScreen.tsx`
- Added template state management
- Loads templates on component mount
- Added template selection UI with:
  - Visual template cards
  - Template name and description
  - Selection indicator (check icon)
  - Highlighted selected template
- Passes selected template to upload API

## Current Template

### Professional Template
- **ID**: `professional`
- **Name**: Professional
- **Description**: Clean ATS-optimized layout perfect for corporate roles
- **Features**:
  - Standard fonts (Helvetica)
  - Clear section dividers
  - ATS-friendly formatting
  - Optimized for corporate/traditional industries

## How to Add More Templates

1. Create a new class in `backend/services/templates.py` that extends `CVTemplate`
2. Implement `get_styles()` method with custom paragraph styles
3. Implement `get_system_prompt()` method with template-specific AI instructions
4. Add the template to the `TEMPLATES` registry
5. Template will automatically appear in the frontend

Example:
```python
class ModernTemplate(CVTemplate):
    def __init__(self):
        super().__init__()
        self.id = "modern"
        self.name = "Modern"
        self.description = "Contemporary design for creative roles"
    
    def get_styles(self):
        # Define custom styles
        pass
    
    def get_system_prompt(self):
        # Define custom prompt
        pass

# Add to registry
TEMPLATES["modern"] = ModernTemplate()
```

## API Endpoints

### GET /api/templates
Returns list of available templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "professional",
      "name": "Professional",
      "description": "Clean ATS-optimized layout perfect for corporate roles",
      "preview_image": "professional_preview.png"
    }
  ]
}
```

### POST /api/upload-resume
Upload and process resume with selected template.

**Parameters:**
- `file`: PDF file (required)
- `template_id`: Template ID (optional, defaults to "professional")

## Testing

Run the test script to verify the template system:
```bash
python test_templates.py
```

## Future Enhancements

1. Add more templates (Modern, Creative, Executive, Academic, etc.)
2. Add template preview images
3. Allow users to customize template colors
4. Save user's preferred template
5. Template-specific formatting rules
6. Export templates as JSON for easier management
