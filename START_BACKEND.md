# How to Start the Backend

## Quick Start

Open a **new terminal** and run:

```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Why `--host 0.0.0.0`?

This allows the backend to accept connections from:
- ✅ localhost (127.0.0.1)
- ✅ Your computer's IP address
- ✅ Mobile devices on the same network
- ✅ Expo Go app on your phone

## Verify Backend is Running

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
✓ GEMINI_API_KEY loaded: AIzaSyC7X0...BgwhI
✓ LLM_MODEL: gemini-2.5-flash
INFO:     Application startup complete.
```

## Test Backend

Open browser and go to:
```
http://localhost:8000
```

You should see:
```json
{
  "message": "Resumax API",
  "status": "running"
}
```

## Common Issues

### Issue: "Network request failed" in app

**Cause:** Backend not running or wrong IP address

**Solution:**
1. Make sure backend is running (see above)
2. Check your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   ```
3. The app should auto-detect the IP from Expo

### Issue: "Address already in use"

**Cause:** Port 8000 is already in use

**Solution:**
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart backend
```

### Issue: CORS errors

**Cause:** Backend not allowing requests from frontend

**Solution:** Already configured in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Network Configuration

### For Mobile Testing (Expo Go):

1. **Ensure same WiFi network:**
   - Computer and phone must be on same WiFi
   - No VPN or firewall blocking

2. **Backend must use `0.0.0.0`:**
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

3. **Expo will auto-detect:**
   - Expo automatically finds your computer's IP
   - API calls will use: `http://192.168.x.x:8000`

### For Web Testing:

1. **Backend can use localhost:**
   ```bash
   uvicorn backend.main:app --port 8000
   ```

2. **Frontend will use:**
   ```
   http://localhost:8000
   ```

## Troubleshooting Steps

1. **Check backend is running:**
   ```bash
   curl http://localhost:8000
   ```

2. **Check from mobile device IP:**
   ```bash
   # Replace with your computer's IP
   curl http://192.168.1.100:8000
   ```

3. **Check firewall:**
   - Windows Firewall might block port 8000
   - Allow Python through firewall

4. **Check Expo logs:**
   - Look for API Base URL in console
   - Should show your computer's IP

## Current Status

**Backend Command:**
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
✓ GEMINI_API_KEY loaded
✓ LLM_MODEL: gemini-2.5-flash
INFO: Application startup complete
```

**API Endpoints:**
- GET http://localhost:8000/ - Health check
- GET http://localhost:8000/api/templates - Get templates
- POST http://localhost:8000/api/upload-resume - Upload resume
- GET http://localhost:8000/api/download/{id} - Download improved resume

## Quick Fix for "Network request failed"

1. **Stop any running backend** (Ctrl+C)
2. **Start with correct host:**
   ```bash
   python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. **Restart Expo app:**
   ```bash
   # In Expo terminal, press 'r' to reload
   ```
4. **Try uploading again**

The error should be fixed! ✅
