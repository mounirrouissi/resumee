from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import tempfile
from datetime import datetime
import uuid
import logging
from typing import Optional
from dotenv import load_dotenv
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Thread pool for running blocking operations without freezing the event loop
# This allows multiple requests to be processed concurrently
executor = ThreadPoolExecutor(max_workers=4)

# Load environment variables from .env file
load_dotenv()

from backend.services.pdf_service import extract_text_from_pdf, generate_improved_pdf
from backend.services.ai_service import improve_resume_text
from backend.services.templates import list_templates, get_template

# Configure logging with explicit stream handler to ensure console output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Force output to console
    ]
)
# Set level for all backend loggers
logging.getLogger("backend").setLevel(logging.INFO)
logger = logging.getLogger(__name__)

# Log environment configuration on startup
logger.info("=" * 80)
logger.info("BACKEND STARTUP - ENVIRONMENT CHECK")
logger.info("=" * 80)
api_key = os.getenv("GEMINI_API_KEY", "")
model = os.getenv("LLM_MODEL", "")
if api_key:
    logger.info(f"✓ GEMINI_API_KEY loaded: {api_key[:10]}...{api_key[-5:]}")
else:
    logger.error("✗ GEMINI_API_KEY NOT FOUND!")
if model:
    logger.info(f"✓ LLM_MODEL: {model}")
else:
    logger.warning("⚠️ LLM_MODEL not set, will use default")
logger.info("=" * 80)

app = FastAPI(title="Resume Improver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "backend/uploads"
OUTPUT_DIR = "backend/outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Progress tracking
progress_store = {}

from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Resume Improver API", "status": "running"}

@app.get("/api/templates")
async def get_templates():
    """Get list of available CV templates."""
    logger.info("Templates endpoint called")
    return {"templates": list_templates()}

@app.get("/api/progress/{file_id}")
async def get_progress(file_id: str):
    """Get processing progress for a file."""
    progress = progress_store.get(file_id, {
        "stage": "initializing",
        "message": "Starting...",
        "progress": 0
    })
    return progress

@app.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    template_id: str = Form(default="professional")
):
    logger.info(f"Upload resume request received. Filename: {file.filename}, Template: {template_id}")
    
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        logger.warning(f"Invalid file format: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Initialize progress
    progress_store[file_id] = {
        "stage": "uploading",
        "message": "Uploading your resume...",
        "progress": 10
    }
    
    original_path = os.path.join(UPLOAD_DIR, f"{file_id}_original.pdf")
    logger.info(f"Processing file {file_id}. Saving to {original_path}")
    
    try:
        contents = await file.read()
        with open(original_path, "wb") as f:
            f.write(contents)
        logger.info(f"File saved successfully. Size: {len(contents)} bytes")
        
        progress_store[file_id] = {
            "stage": "uploaded",
            "message": "Upload complete! Extracting text...",
            "progress": 25
        }
        
        logger.info("=" * 80)
        logger.info("STEP 1: TEXT EXTRACTION")
        logger.info("=" * 80)
        
        progress_store[file_id] = {
            "stage": "extracting",
            "message": "Reading your resume with OCR...",
            "progress": 40
        }
        
        # Run blocking PDF extraction in thread pool to avoid blocking event loop
        loop = asyncio.get_event_loop()
        original_text = await loop.run_in_executor(
            executor, extract_text_from_pdf, original_path
        )
        logger.info(f"✓ Text extraction complete")
        logger.info(f"   Extracted length: {len(original_text)} characters")
        logger.info(f"   Preview (first 200 chars): {original_text[:200]}")
        
        if not original_text.strip():
            logger.error("✗ Extracted text is empty!")
            progress_store[file_id] = {
                "stage": "error",
                "message": "Could not extract text from PDF",
                "progress": 0
            }
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        logger.info("=" * 80)
        logger.info("STEP 2: AI IMPROVEMENT (JSON MODE)")
        logger.info(f"   Template: {template_id}")
        logger.info("=" * 80)
        
        progress_store[file_id] = {
            "stage": "improving",
            "message": "AI is enhancing your resume...",
            "progress": 60
        }
        
        # improved_data is now a dict (JSON)
        improved_data = await improve_resume_text(original_text, file_id, template_id)
        
        logger.info("=" * 80)
        logger.info("✓ AI improvement complete")
        logger.info(f"   Data keys: {list(improved_data.keys())}")
        
        # Save debug output (Persist data for later generation)
        debug_path = os.path.join(OUTPUT_DIR, f"{file_id}_debug.json")
        import json
        with open(debug_path, "w", encoding="utf-8") as f:
            json.dump(improved_data, f, indent=2)
        logger.info(f"Debug JSON saved to: {debug_path}")
        logger.info("=" * 80)
        
        progress_store[file_id] = {
            "stage": "formatting",
            "message": "Formatting your professional resume...",
            "progress": 80
        }
        
        logger.info("=" * 80)
        logger.info("STEP 3: PDF GENERATION")
        logger.info("=" * 80)
        
        # Generate the PDF immediately
        improved_path = os.path.join(OUTPUT_DIR, f"{file_id}_improved.pdf")
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            executor, generate_improved_pdf, improved_data, improved_path, template_id
        )
        
        logger.info(f"✓ PDF generated successfully: {improved_path}")
        logger.info("=" * 80)
        
        progress_store[file_id] = {
            "stage": "complete",
            "message": "Your resume is ready!",
            "progress": 100
        }
        
        return {
            "id": file_id,
            "original_filename": file.filename,
            "timestamp": timestamp,
            "original_text": original_text,
            "improved_data": improved_data,
            "download_url": f"/api/download/{file_id}"
        }
    
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}", exc_info=True)
        progress_store[file_id] = {
            "stage": "error",
            "message": f"Error: {str(e)}",
            "progress": 0
        }
        if os.path.exists(original_path):
            os.remove(original_path)
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.get("/api/download/{file_id}")
async def download_resume(file_id: str):
    logger.info(f"Download request for file_id: {file_id}")
    file_path = os.path.join(OUTPUT_DIR, f"{file_id}_improved.pdf")
    
    if not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    logger.info(f"Serving file: {file_path}")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"improved_resume_{file_id}.pdf"
    )

from pydantic import BaseModel
from backend.services.revenue_cat_service import revenue_cat_service

class GeneratePDFRequest(BaseModel):
    file_id: str
    user_id: str
    template_id: str = "professional"

@app.get("/health")
async def health_check():
    logger.info("Health check called")
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/generate-pdf")
async def generate_pdf(request: GeneratePDFRequest):
    """
    Generate PDF for a file. Requires Pro Access verification.
    """
    logger.info(f"Generate PDF request for file: {request.file_id}, User: {request.user_id}")
    
    # 1. Verify Entitlement
    if not revenue_cat_service.verify_pro_access(request.user_id):
        logger.warning(f"Access denied for user {request.user_id}")
        raise HTTPException(status_code=403, detail="Pro access required to generate PDF")
        
    # 2. Load Data
    debug_path = os.path.join(OUTPUT_DIR, f"{request.file_id}_debug.json")
    if not os.path.exists(debug_path):
        raise HTTPException(status_code=404, detail="Resume data not found. Please upload again.")
        
    import json
    with open(debug_path, "r", encoding="utf-8") as f:
        improved_data = json.load(f)
        
    # 3. Generate PDF
    improved_path = os.path.join(OUTPUT_DIR, f"{request.file_id}_improved.pdf")
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        executor, generate_improved_pdf, improved_data, improved_path, request.template_id
    )
    
    return {
        "status": "success",
        "download_url": f"/api/download/{request.file_id}"
    }
