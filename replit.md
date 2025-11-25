# Resume Improver App - Replit Migration

## Project Overview
An AI-powered mobile and web application that analyzes and improves resumes/CVs using Google's Gemini AI.

## Current Status
- **Backend**: FastAPI running on port 8000 ✅
- **Frontend**: Expo (React Native) - configured for web
- **PDF Extraction**: PaddleOCR for advanced text recognition from PDFs
- **AI Engine**: Google Gemini 1.5 Flash

## Tech Stack
- **Frontend**: React Native (Expo), TypeScript, React Navigation
- **Backend**: FastAPI (Python), PaddleOCR, ReportLab, pdf2image
- **Database**: File-based uploads/outputs
- **AI**: Google Generative AI API (Gemini)

## Recent Changes (Nov 25, 2025)
1. Added Google authentication with OAuth integration
2. Implemented "Continue as guest" functionality
3. Updated UserContext to manage authentication state (Google vs guest)
4. Created LoginScreen with Google sign-in button and guest option
5. Updated ProfileScreen to show different UI for authenticated vs guest users
   - Google users see their name, email, and profile picture
   - Guest users can edit their display name
   - All users can sign out to return to login screen
6. Installed OAuth dependencies (expo-auth-session, expo-web-browser)

## Previous Changes (Nov 24, 2025)
1. Updated PDF text extraction to use PaddleOCR instead of PyPDF2 for better accuracy
2. Lazy-loaded OCR instance to avoid startup delays
3. Installed all required dependencies (paddle, paddleocr, fastapi, uvicorn, etc.)
4. Configured workflow to run both backend and frontend
5. Set up environment for Replit deployment

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key (required for AI features)
- `LLM_MODEL`: Set to `gemini-1.5-flash` by default

### Google OAuth Configuration (Optional)
To enable Google sign-in on the app, you need to set up OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web, Android, iOS)
5. Add the following environment variables:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Web client ID
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: Android client ID
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: iOS client ID

**Note**: The app works fully in guest mode without Google OAuth configured.

## File Structure
```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── services/
│   │   ├── ai_service.py    # Gemini AI integration
│   │   └── pdf_service.py   # PDF processing with PaddleOCR
│   ├── uploads/             # Temporary PDF uploads
│   └── outputs/             # Generated improved PDFs
├── screens/                 # React Native screen components
├── components/              # Reusable React components
├── services/                # API client services
├── contexts/                # React Context state management
├── hooks/                   # Custom React hooks
├── navigation/              # React Navigation setup
├── constants/               # Theme and configuration
├── assets/                  # Images and icons
├── app.json                 # Expo configuration
├── App.tsx                  # Main app component
├── package.json             # Frontend dependencies
├── pyproject.toml           # Python project config
└── start_app.sh             # Startup script (backend + frontend)
```

## How to Run
```bash
bash start_app.sh
```
This starts both the FastAPI backend (port 8000) and Expo frontend.

## User Preferences
- Using PaddleOCR for PDF text extraction (requested)
- File-based storage for resumes and outputs
- Cross-platform support (iOS, Android, Web)

## Next Steps for User
1. Provide Gemini API key to enable AI features
2. Push to GitHub (git remote + git push)
3. Customize AI improvement prompts if needed
4. Test PDF upload and processing flow
