# Template UI Update - Simplified Design

## Changes Made

### UI Design
- **Single Large Preview**: Shows one large template preview card (500px height)
- **Template Info Below**: Name and description centered below the preview
- **Clean Layout**: Removed carousel, simplified to focus on the one Harvard template
- **Click to Preview**: Users can click the preview to see full-screen modal

### Features
- **Web**: Shows live PDF preview in iframe
- **Mobile**: Shows placeholder with "Tap to preview" message
- **Modal Preview**: Full-screen modal for detailed template viewing
- **Responsive**: Works on all screen sizes

### Template Display
```
┌─────────────────────────────┐
│                             │
│    [Large PDF Preview]      │
│         500px tall          │
│                             │
└─────────────────────────────┘

      Harvard CV Format
The gold standard resume template.
Clean, professional, and proven
        effective.
```

## Files Modified
- `screens/UploadScreen.tsx` - Simplified template selection UI
- `backend/main.py` - Fixed directory initialization order
- `backend/services/templates.py` - Updated preview URL
- `services/resumeApi.ts` - Added getTemplatePreviewUrl method

## How It Works
1. User uploads a file
2. Large preview card shows the Harvard template
3. Template name and description displayed below
4. User can click to see full preview in modal
5. Template is automatically selected (only one available)
6. User clicks "Process Resume" to continue
