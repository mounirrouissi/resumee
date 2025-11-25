# Resume Improver App

An AI-powered mobile and web application that analyzes and improves your CV/resume using Google's Gemini AI.

## Features

- 📄 Upload PDF resumes
- 🤖 AI-powered content improvement using Gemini
- 📱 Cross-platform (iOS, Android, Web)
- 💾 Download improved resume as PDF
- 📊 View processing history

## Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- React Navigation

**Backend:**
- FastAPI (Python)
- Google Gemini AI
- PyPDF2 for PDF processing
- ReportLab for PDF generation

## Setup Instructions

### 1. Get Gemini API Key (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Backend Setup

```bash
# Install Python dependencies
pip install fastapi uvicorn google-generativeai pypdf2 python-dotenv python-multipart reportlab

# Create .env file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_api_key_here
LLM_MODEL=gemini-1.5-flash

# Start the backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will run on http://localhost:8000

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### 4. Run the App

**Web:**
- Press `w` in the terminal or open http://localhost:8081

**Mobile:**
- Install "Expo Go" app on your phone
- Scan the QR code shown in terminal

## Usage

1. **Upload Resume**: Tap the upload zone and select a PDF file
2. **Process**: Click "Process Resume" to analyze with AI
3. **Review**: View original vs improved content
4. **Download**: Save the improved resume as PDF

## API Endpoints

- `POST /api/upload-resume` - Upload and process resume
- `GET /api/download/{file_id}` - Download improved resume
- `GET /health` - Health check

## Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-1.5-flash
```

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app
│   └── services/
│       ├── ai_service.py    # Gemini AI integration
│       └── pdf_service.py   # PDF processing
├── screens/
│   ├── UploadScreen.tsx     # Resume upload
│   ├── PreviewScreen.tsx    # View results
│   └── HistoryScreen.tsx    # Past resumes
├── services/
│   └── resumeApi.ts         # API client
└── contexts/
    └── ResumeContext.tsx    # State management
```

## Notes

- Gemini 1.5 Flash is free with rate limits
- PDF files only (max size depends on your backend config)
- Improved resumes maintain original structure
- All processing happens server-side

## Troubleshooting

**Backend not starting:**
- Ensure Python 3.9+ is installed
- Check if port 8000 is available
- Verify Gemini API key is valid

**File upload fails:**
- Check backend is running on port 8000
- Ensure PDF file is valid
- Check network connectivity

**AI improvement not working:**
- Verify GEMINI_API_KEY in .env
- Check API quota limits
- Review backend logs for errors

## License

MIT
