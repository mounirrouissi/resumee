# Professional PDF Filename Update

## Changes Made

All generated PDFs are now named **"CV.pdf"** instead of technical filenames like `improved_resume_{uuid}.pdf`.

---

## Files Modified

### 1. **screens/PreviewScreen.tsx**

#### Download Function
**Before:**
```typescript
const fileUri = FileSystem.documentDirectory + `improved_resume_${resume.id}.pdf`;
```

**After:**
```typescript
const fileUri = FileSystem.documentDirectory + 'CV.pdf';
```

**Result:** When users download, the file is saved as "CV.pdf"

---

#### Share Function
**Before:**
```typescript
const fileUri = FileSystem.documentDirectory + `improved_resume_${resume.id}.pdf`;
// Check if exists, reuse cached file
```

**After:**
```typescript
const fileUri = FileSystem.documentDirectory + 'CV.pdf';
// Always download fresh copy for sharing
```

**Changes:**
- Filename changed to "CV.pdf"
- Always downloads fresh copy (no caching check)
- Dialog title updated to "Share Your CV"

**Result:** When users share, recipients see "CV.pdf" in their downloads

---

### 2. **backend/main.py**

#### Download Endpoint
**Before:**
```python
return FileResponse(
    file_path,
    media_type="application/pdf",
    filename=f"improved_resume_{file_id}.pdf"
)
```

**After:**
```python
return FileResponse(
    file_path,
    media_type="application/pdf",
    filename="CV.pdf"
)
```

**Result:** Backend serves the file with "CV.pdf" as the download name

---

## Benefits

1. **Professional Appearance:** "CV.pdf" looks much more professional than technical UUIDs
2. **Easy to Find:** Users can easily locate "CV.pdf" in their downloads folder
3. **Consistent Naming:** Same filename across download and share actions
4. **International Standard:** "CV" is universally recognized (Curriculum Vitae)
5. **Clean File Management:** No confusion with multiple versions having different IDs

---

## User Experience

### Before:
- Download: `improved_resume_dd1b9521-f32b-4bbc-8b8a-63c5bae4b91a.pdf`
- Share: `improved_resume_dd1b9521-f32b-4bbc-8b8a-63c5bae4b91a.pdf`

### After:
- Download: `CV.pdf` ✨
- Share: `CV.pdf` ✨

---

## Testing Checklist

- [ ] Download button saves file as "CV.pdf"
- [ ] Share button shares file as "CV.pdf"
- [ ] Web download shows "CV.pdf" in browser
- [ ] Mobile share dialog shows "CV.pdf"
- [ ] Recipients receive "CV.pdf" when shared

---

## Note

The file is always named "CV.pdf" regardless of:
- User's name
- Template used
- Number of times generated

If users want to keep multiple versions, they should rename them after download (e.g., "CV_Company_Name.pdf").
