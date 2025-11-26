# Troubleshooting: App Stuck on "Processing Resume"

## Issue
App shows "Processing Resume - Uploading and processing your resume..." and never completes.

## ✅ **FIXED: Backend Restarted**

The backend server had stopped. It's now running again at:
```
http://127.0.0.1:8000
✓ GEMINI_API_KEY loaded
✓ LLM_MODEL: gemini-2.5-flash
```

---

## Common Causes & Solutions

### 1. **Backend Not Running** ✅ FIXED
**Symptom:** App stuck, no response
**Cause:** Backend server stopped or crashed
**Solution:** Backend has been restarted

**To verify backend is running:**
```bash
# Check if backend is responding
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status": "healthy", "timestamp": "2025-11-25T..."}
```

---

### 2. **Frontend Can't Connect to Backend**
**Symptom:** App stuck, network error in console
**Cause:** Wrong backend URL or CORS issue

**Check frontend API configuration:**
```typescript
// services/resumeApi.ts
const API_BASE_URL = getBaseUrl();
// Should return: http://localhost:8000 or http://YOUR_IP:8000
```

**Solution:**
1. Check your IP address:
   ```bash
   ipconfig
   # Look for IPv4 Address
   ```

2. Update `services/resumeApi.ts` if needed:
   ```typescript
   // For mobile testing, use your computer's IP
   return 'http://192.168.1.XXX:8000';
   ```

3. Restart Expo:
   ```bash
   # Press 'r' in Expo terminal to reload
   ```

---

### 3. **API Key Invalid or Blocked**
**Symptom:** Processing takes long time, then fails
**Cause:** Gemini API key is blocked or invalid

**Check backend logs for:**
```
✗ AI SERVICE ERROR: 403 Your API key was reported as leaked
```

**Solution:**
1. Get new API key: https://makersuite.google.com/app/apikey
2. Update `.env`:
   ```env
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
3. Restart backend

---

### 4. **Large PDF Taking Too Long**
**Symptom:** Processing for 2+ minutes
**Cause:** Large PDF with many pages or images

**Normal processing times:**
- Small PDF (1-2 pages): 20-40 seconds
- Medium PDF (3-5 pages): 40-90 seconds
- Large PDF (6+ pages): 90-180 seconds

**Solution:** Wait longer or optimize PDF:
- Reduce PDF size
- Remove unnecessary pages
- Compress images

---

### 5. **Network Timeout**
**Symptom:** App stuck after 60 seconds
**Cause:** Request timeout

**Check frontend timeout settings:**
```typescript
// services/resumeApi.ts
const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
  method: 'POST',
  body: formData,
  // Add timeout if needed
});
```

**Solution:** Increase timeout or check network

---

### 6. **Frontend State Not Updating**
**Symptom:** Backend completes but app still shows "Processing"
**Cause:** Frontend state management issue

**Check ResumeContext:**
```typescript
// contexts/ResumeContext.tsx
setCurrentProcessingId(null); // Should be called on completion
```

**Solution:** Check browser/app console for errors

---

## Quick Diagnostic Steps

### Step 1: Check Backend
```bash
# Is backend running?
curl http://localhost:8000/health

# Expected: {"status": "healthy", ...}
```

### Step 2: Check Backend Logs
Look for:
```
✓ Text extraction complete
✓ AI improvement complete
✓ PDF generated successfully
```

### Step 3: Check Frontend Console
Look for:
```
Network error
CORS error
Timeout error
```

### Step 4: Test API Directly
```bash
# Test templates endpoint
curl http://localhost:8000/api/templates

# Expected: {"templates": [...]}
```

---

## Current Status

### ✅ Backend Status:
```
Running: YES
Port: 8000
API Key: Loaded
Model: gemini-2.5-flash
Health: OK
```

### 🔧 What to Do Now:

1. **Refresh the app:**
   - Close and reopen the app
   - Or press 'r' in Expo terminal

2. **Try uploading again:**
   - Select a PDF
   - Choose template
   - Tap "Process Resume"

3. **Watch backend logs:**
   - You should see processing steps
   - Check for any errors

4. **If still stuck:**
   - Check frontend console for errors
   - Verify network connection
   - Try a smaller PDF first

---

## Prevention

### Keep Backend Running:
```bash
# Start backend in a dedicated terminal
python -m uvicorn backend.main:app --reload --port 8000

# Don't close this terminal
```

### Monitor Backend:
```bash
# Watch for these logs:
✓ Text extraction complete
✓ AI improvement complete  
✓ PDF generated successfully
```

### Frontend Connection:
```typescript
// Ensure correct API URL
const API_BASE_URL = 'http://YOUR_IP:8000';
```

---

## Testing Checklist

After restart, verify:

- [ ] Backend responds to http://localhost:8000/health
- [ ] Templates endpoint works: http://localhost:8000/api/templates
- [ ] Frontend can connect (check console)
- [ ] Upload a small test PDF
- [ ] Watch backend logs for progress
- [ ] App shows preview screen after processing
- [ ] Download button works

---

## Common Error Messages

### "Network request failed"
**Cause:** Frontend can't reach backend
**Fix:** Check API_BASE_URL, ensure backend is running

### "Failed to upload resume"
**Cause:** Backend error or timeout
**Fix:** Check backend logs for specific error

### "Could not extract text from PDF"
**Cause:** PDF is corrupted or encrypted
**Fix:** Try a different PDF

### "AI service error"
**Cause:** API key issue or model error
**Fix:** Check API key, verify model name

---

## Need More Help?

### Check These Files:
1. **Backend logs** - Terminal running uvicorn
2. **Frontend console** - Browser DevTools or React Native debugger
3. **Network tab** - Check API requests/responses

### Useful Commands:
```bash
# Restart backend
Ctrl+C (stop)
python -m uvicorn backend.main:app --reload --port 8000

# Restart frontend
Press 'r' in Expo terminal

# Check backend health
curl http://localhost:8000/health
```

---

## Summary

**Issue:** App stuck on processing
**Cause:** Backend was stopped
**Fix:** Backend restarted ✅

**Next Steps:**
1. Refresh your app
2. Try uploading again
3. Watch backend logs
4. Should work now! 🎉
