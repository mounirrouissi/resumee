# How to Restart Backend with Environment Variables

## The Issue
The backend wasn't loading the `.env` file, so the `GEMINI_API_KEY` was not being read.

## The Fix
Added `load_dotenv()` to `backend/main.py` to properly load environment variables from the `.env` file.

## How to Restart the Backend

### Option 1: Using uvicorn directly
```bash
# Stop the current backend (Ctrl+C if running)
# Then start with:
python -m uvicorn backend.main:app --reload --port 8000
```

### Option 2: Using the start script
```bash
# Stop the current backend (Ctrl+C if running)
# Then:
bash start_backend.sh
```

### Option 3: Using Python directly
```bash
# Stop the current backend (Ctrl+C if running)
# Then:
cd backend
python -m uvicorn main:app --reload --port 8000
```

## Verify It's Working

After restarting, you should see these logs:

```
INFO:     Started server process
INFO:     Waiting for application startup.
================================================================================
BACKEND STARTUP - ENVIRONMENT CHECK
================================================================================
✓ GEMINI_API_KEY loaded: AIzaSyAaqW...3phHE
✓ LLM_MODEL: gemini-2.5-flash
================================================================================
INFO:     Application startup complete.
```

## What to Look For

### ✓ SUCCESS - You should see:
```
✓ GEMINI_API_KEY loaded: AIzaSyAaqW...3phHE
✓ LLM_MODEL: gemini-2.5-flash
```

### ✗ FAILURE - If you see:
```
✗ GEMINI_API_KEY NOT FOUND!
```

Then:
1. Make sure `.env` file exists in the root directory
2. Check `.env` file has the correct format:
   ```
   GEMINI_API_KEY=AIzaSyAaqWSyIURwZXkjpp6gDe56xJmdyN3phHE
   LLM_MODEL=gemini-2.5-flash
   ```
3. Make sure there are no extra spaces or quotes around the values

## New Logging Features

The backend now has comprehensive logging that will show:

### During Upload:
```
================================================================================
STEP 1: TEXT EXTRACTION
================================================================================
✓ Text extraction complete
   Extracted length: 1234 characters
   Preview (first 200 chars): John Doe...

================================================================================
STEP 2: AI IMPROVEMENT
   Template: professional
================================================================================
```

### During AI Processing:
```
================================================================================
STARTING RESUME IMPROVEMENT PROCESS
================================================================================
File ID: abc-123
Template ID: professional
Original text length: 1234 characters

📊 Step 1: Generating improvement analysis...
✓ Analysis complete. Suggestions length: 456 characters

📝 Step 2: Loading template 'professional'...
✓ Template loaded. Prompt length: 4169 characters

🚀 Step 3: Sending improvement request to Gemini...
   Total prompt length: 5403 characters
   Model: gemini-2.5-flash
   Temperature: 0.7
   Max tokens: 8000

✓ Received response from Gemini
✓ Improved text length: 2345 characters
   Original length: 1234 characters
   Change: +1111 characters
✓ Text was successfully improved

💾 Saving improvement analysis to file...
================================================================================
✓ RESUME IMPROVEMENT COMPLETED SUCCESSFULLY
   Final text length: 2345 characters
================================================================================
```

### If Something Goes Wrong:
```
⚠️⚠️⚠️ WARNING: ORIGINAL AND IMPROVED TEXT ARE IDENTICAL! ⚠️⚠️⚠️
   This indicates the AI improvement did not work!
```

or

```
✗ AI SERVICE ERROR: 403 Your API key was reported as leaked
================================================================================
⚠️ Falling back to simulation mode...
```

## Troubleshooting

### Problem: "No Gemini API key found"
**Solution:** 
1. Check `.env` file exists
2. Restart the backend
3. Look for the startup logs showing API key loaded

### Problem: "403 Your API key was reported as leaked"
**Solution:**
1. Get a new API key from https://makersuite.google.com/app/apikey
2. Update `.env` file
3. Restart backend

### Problem: "404 models/gemini-1.5-flash is not found"
**Solution:**
1. Update `.env` to use `LLM_MODEL=gemini-2.5-flash`
2. Restart backend

### Problem: Original and improved text are identical
**Solution:**
1. Check the logs for error messages
2. Verify API key is loaded (see startup logs)
3. Check if API key is valid (not blocked)
4. Look for "Falling back to simulation mode" in logs

## Next Steps

After restarting:
1. Upload a test resume
2. Watch the backend logs
3. Check if you see the comprehensive logging
4. Verify the improved text is different from original
5. Download the improved PDF and check formatting
