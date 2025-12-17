# Project: Resumax

## Project Overview

This is a full-stack mobile and web application that helps users improve their CVs/resumes using AI. The application is built with a React Native (Expo) frontend and a Python (FastAPI) backend. The core functionality is to upload a PDF resume, have it analyzed and improved by Google's Gemini AI, and then download the improved version as a PDF. The backend also uses OCR to extract text from the PDF.

**Frontend:**
- React Native (Expo) for cross-platform mobile and web development.
- TypeScript for type-safe code.
- React Navigation for screen navigation.
- Context API for state management (`UserContext`, `ResumeContext`, `CreditsContext`, `RevenueCatContext`).

**Backend:**
- FastAPI for the web server.
- Google's Gemini AI for resume text improvement.
- Paddle and Pytesseract for OCR text extraction from PDFs.
- ReportLab for generating the improved PDF.
- RevenueCat for managing "Pro Access" to certain features.

## Building and Running

### Backend

1.  **Install dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    LLM_MODEL=gemini-1.5-flash
    ```

3.  **Run the server:**
    ```bash
    python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    The backend will be available at `http://localhost:8000`.

### Frontend

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the application:**
    ```bash
    npx expo start
    ```
    This will start the Expo development server. You can then run the app on a mobile device using the Expo Go app or in a web browser.

    -   To run on Android: `npm run android`
    -   To run on iOS: `npm run ios`
    -   To run on web: `npm run web`

## Development Conventions

-   **Linting:** The project uses ESLint for linting the frontend code. Run `npm run lint` to check for linting errors.
-   **Formatting:** The project uses Prettier for code formatting. Run `npm run format` to format the code.
-   **API:** The frontend communicates with the backend via a REST API. The API client is located in `services/resumeApi.ts`.
-   **State Management:** Global state is managed using React's Context API. The context providers are set up in `App.tsx`.
-   **Styling:** The project uses a custom theme located in `constants/theme.ts`.
