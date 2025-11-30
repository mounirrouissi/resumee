# Template Preview Feature

## Overview
Users can now preview how their resume will look with different templates before processing.

## How It Works

### Backend Changes

1. **New Endpoint**: `/api/template-preview/{template_id}`
   - Generates a sample PDF showing the template format
   - Uses the Harvard CV example format
   - Cached after first generation

2. **Static File Serving**
   - Added FastAPI StaticFiles support
   - Preview images can be served from `/static/previews/`

3. **Template Updates**
   - Updated `ProfessionalTemplate` to include preview URL
   - Preview shows the exact Harvard CV format that will be used

### Frontend Changes

1. **Preview Button**
   - Added "Preview Example" button to each template card
   - Shows eye icon for better UX

2. **Preview Modal**
   - Full-screen modal displaying the template preview
   - Web: Shows PDF in iframe
   - Mobile: Shows informational message (PDF preview not available)

3. **API Integration**
   - New `getTemplatePreviewUrl()` method in resumeApi
   - Handles preview URL generation

## User Experience

1. User uploads their resume
2. User sees available templates
3. User clicks "Preview Example" on any template
4. Modal opens showing a sample resume in that format
5. User can compare templates before selecting
6. User selects their preferred template and processes

## Example Preview Content

The preview shows a sample Harvard CV with:
- Centered header with name and contact info
- Education section (MIT Sloan example)
- Experience section (McKinsey example)
- Personal information section
- Proper formatting with bullets and spacing

This matches the exact format described in the image you provided.

## Technical Details

- Preview PDFs are generated once and cached in `backend/outputs/`
- Uses the same PDF generation logic as the main resume processing
- Template formatting markers ensure consistent output
- Responsive modal design works on web and mobile
