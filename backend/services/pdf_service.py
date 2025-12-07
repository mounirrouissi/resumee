import cv2
import numpy as np
from paddleocr import PaddleOCR
from pdf2image import convert_from_path
import pytesseract
import PyPDF2
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.enums import TA_LEFT
from PIL import Image
import logging
import os

logger = logging.getLogger(__name__)

_ocr_instance = None

def get_paddle_ocr():
    """Initialize PaddleOCR instance (singleton pattern)."""
    global _ocr_instance
    if _ocr_instance is None:
        logger.info("Initializing PaddleOCR...")
        try:
            # Use minimal parameters for maximum compatibility
            _ocr_instance = PaddleOCR(lang='en')
            logger.info("PaddleOCR initialized successfully")
        except Exception as e:
            logger.error(f"PaddleOCR initialization failed: {str(e)}")
            raise
    return _ocr_instance

def extract_text_with_paddle_ocr(pdf_path: str) -> tuple[str, bool]:
    """
    Extract text using PaddleOCR with resume-specific optimizations.
    Handles images, tables, multiple columns, and complex layouts.
    Returns: (extracted_text, success)
    """
    try:
        logger.info("Attempting text extraction with PaddleOCR (Resume-optimized)...")
        
        # Convert PDF to images - use 200 DPI for balance of speed vs quality 
        # (300 DPI is overkill and 3x slower)
        images = convert_from_path(pdf_path, dpi=200)
        logger.info(f"Converted PDF to {len(images)} images at 200 DPI")
        
        ocr = get_paddle_ocr()
        all_text = []
        
        for i, image in enumerate(images):
            # Convert PIL image to numpy array (use RGB directly, no preprocessing)
            # PaddleOCR works best with clean color images
            img_array = np.array(image)
            
            # Try original image first (works better for clean PDFs)
            logger.info(f"Page {i+1}: Processing with original image...")
            try:
                result = ocr.ocr(img_array)
            except Exception as ocr_error:
                logger.warning(f"Page {i+1}: OCR error on original image: {str(ocr_error)}")
                result = None
            
            # If result is poor, try with grayscale image (simpler preprocessing, still fast)
            if not result or not result[0] or len(result[0]) < 5:
                logger.info(f"Page {i+1}: Retrying with grayscale image...")
                try:
                    # Simple grayscale conversion as fallback
                    if len(img_array.shape) == 3:
                        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                        # Convert back to 3 channels for PaddleOCR
                        gray_3ch = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
                        result = ocr.ocr(gray_3ch)
                    else:
                        result = ocr.ocr(img_array)
                except Exception as ocr_error:
                    logger.warning(f"Page {i+1}: OCR error on grayscale image: {str(ocr_error)}")
                    result = None
            
            if result and result[0]:
                page_text = []
                
                # Debug: Log the raw result structure to understand the format
                if result[0] and len(result[0]) > 0:
                    sample = result[0][0]
                    logger.info(f"Page {i+1}: OCR result sample structure: {type(sample)}, len={len(sample) if hasattr(sample, '__len__') else 'N/A'}")
                    if len(result[0]) > 0:
                        logger.info(f"Page {i+1}: Sample item: {str(sample)[:200]}")
                
                # Sort by vertical position (top to bottom) then horizontal (left to right)
                # This helps maintain proper reading order in multi-column resumes
                try:
                    sorted_lines = sorted(result[0], key=lambda x: (x[0][0][1], x[0][0][0]))
                except (IndexError, TypeError) as sort_error:
                    logger.warning(f"Page {i+1}: Could not sort lines, using original order: {sort_error}")
                    sorted_lines = result[0]
                
                for line in sorted_lines:
                    try:
                        # Handle different PaddleOCR result formats defensively
                        # Format can be: [[box], (text, confidence)] or [[box], [text, confidence]]
                        if not line or len(line) < 2:
                            continue
                        
                        text_data = line[1]
                        if isinstance(text_data, (list, tuple)) and len(text_data) >= 2:
                            text = str(text_data[0]).strip() if text_data[0] else ""
                            confidence = float(text_data[1]) if text_data[1] else 0.0
                        elif isinstance(text_data, str):
                            text = text_data.strip()
                            confidence = 1.0  # Assume high confidence if not provided
                        else:
                            continue
                        
                        # Only include text with reasonable confidence (>0.5)
                        if text and confidence > 0.5:
                            page_text.append(text)
                        elif text:
                            logger.debug(f"Skipped low-confidence text: {text} (confidence: {confidence:.2f})")
                    except (IndexError, TypeError, ValueError) as line_error:
                        logger.debug(f"Page {i+1}: Skipped malformed line: {line_error}")
                
                # Check if we're getting single characters (PaddleOCR character-level output)
                # If so, try to group them into words based on horizontal proximity
                if page_text and all(len(t) <= 2 for t in page_text[:20]):
                    logger.warning(f"Page {i+1}: Detected character-level output, grouping into words...")
                    # Join consecutive single characters (this is a fallback)
                    grouped_text = ' '.join(page_text)
                    page_text = [grouped_text]
                    logger.info(f"Page {i+1}: Grouped text sample: {grouped_text[:100]}")
                
                page_content = '\n'.join(page_text)
                all_text.append(page_content)
                logger.info(f"Page {i+1}: Extracted {len(page_content)} characters ({len(page_text)} lines)")
            else:
                logger.warning(f"Page {i+1}: No text detected")
        
        extracted = '\n\n'.join(all_text)
        logger.info(f"PaddleOCR extraction complete. Total: {len(extracted)} characters")
        
        # Final check: warn if extraction seems poor
        if len(extracted) < 100:
            logger.warning(f"⚠️ OCR extracted very little content ({len(extracted)} chars). This PDF may need special handling.")
        
        return extracted, True
        
    except Exception as e:
        logger.warning(f"PaddleOCR failed: {str(e)}")
        return "", False

def extract_text_with_tesseract(pdf_path: str) -> tuple[str, bool]:
    """
    Extract text using Tesseract OCR.
    Returns: (extracted_text, success)
    """
    try:
        logger.info("Attempting text extraction with Tesseract OCR...")
        images = convert_from_path(pdf_path)
        logger.info(f"Converted PDF to {len(images)} images")
        
        all_text = []
        
        for i, image in enumerate(images):
            # Use pytesseract to extract text
            text = pytesseract.image_to_string(image, lang='eng')
            all_text.append(text)
            logger.info(f"Page {i+1}: Extracted {len(text)} characters")
        
        extracted = '\n\n'.join(all_text)
        logger.info(f"Tesseract extraction complete. Total: {len(extracted)} characters")
        return extracted, True
        
    except Exception as e:
        logger.warning(f"Tesseract failed: {str(e)}")
        return "", False

def extract_text_with_pypdf2(pdf_path: str) -> tuple[str, bool]:
    """
    Extract text using PyPDF2 (direct text extraction, no OCR).
    Returns: (extracted_text, success)
    """
    try:
        logger.info("Attempting text extraction with PyPDF2...")
        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            num_pages = len(reader.pages)
            logger.info(f"PDF has {num_pages} pages")
            
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                logger.debug(f"Extracted {len(extracted) if extracted else 0} chars from page {i+1}")
        
        logger.info(f"PyPDF2 extraction complete. Total: {len(text)} characters")
        return text.strip(), True
        
    except Exception as e:
        logger.warning(f"PyPDF2 failed: {str(e)}")
        return "", False

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF using multiple OCR methods with fallback.
    Priority: PaddleOCR -> Tesseract -> PyPDF2
    """
    try:
        logger.info(f"Starting text extraction from PDF: {pdf_path}")
        logger.info("=" * 80)
        
        ocr_method_used = "None"
        extracted_text = ""
        
        # Try PyPDF2 FIRST (fast for digital PDFs - most common case)
        logger.info("PRIMARY METHOD: Attempting PyPDF2 (fast for digital PDFs)...")
        text, success = extract_text_with_pypdf2(pdf_path)
        if success and text.strip():
            ocr_method_used = "PyPDF2 (Direct Text Extraction)"
            extracted_text = text
            logger.info("✓ PyPDF2 succeeded! (Fast extraction)")
        else:
            logger.warning("✗ PyPDF2 failed or returned empty text")
            logger.info("   This might be a scanned PDF, trying OCR methods...")
            
            # Try PaddleOCR FIRST for scanned PDFs (better quality)
            logger.info("BACKUP METHOD: Attempting PaddleOCR (High Quality)...")
            text, success = extract_text_with_paddle_ocr(pdf_path)
            if success and text.strip():
                ocr_method_used = "PaddleOCR"
                extracted_text = text
                logger.info("✓ PaddleOCR succeeded!")
            else:
                logger.warning("✗ PaddleOCR failed or returned empty text")
                
                # Try Tesseract as final fallback
                logger.info("FALLBACK METHOD: Attempting Tesseract OCR...")
                text, success = extract_text_with_tesseract(pdf_path)
                if success and text.strip():
                    ocr_method_used = "Tesseract OCR"
                    extracted_text = text
                    logger.info("✓ Tesseract OCR succeeded!")
                else:
                    logger.error("✗ All extraction methods failed!")
                    raise Exception("All OCR methods failed to extract text")
        
        logger.info("=" * 80)
        
        # Calculate number of pages
        if ocr_method_used == 'PyPDF2 (Direct Text Extraction)':
            with open(pdf_path, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                num_pages = len(reader.pages)
        else:
            # For OCR methods, we already know the page count from convert_from_path
            num_pages = "Already processed via image conversion"
        
        # Save extracted text to file
        ocr_output_path = pdf_path.replace('_original.pdf', '_ocr_result.txt')
        with open(ocr_output_path, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("OCR EXTRACTION RESULT\n")
            f.write(f"Method: {ocr_method_used}\n")
            f.write(f"Source: {pdf_path}\n")
            f.write(f"Total Characters: {len(extracted_text)}\n")
            f.write(f"Number of Pages: {num_pages}\n")
            f.write("=" * 80 + "\n\n")
            f.write(extracted_text)
        logger.info(f"OCR results saved to: {ocr_output_path}")
        
        return extracted_text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
        raise Exception(f"Error extracting text from PDF: {str(e)}")

from fpdf import FPDF

# --- HELPER: HARVARD PDF GENERATOR ---
class HarvardPDF(FPDF):
    def sanitize(self, text):
        """Sanitize text to be compatible with FPDF latin-1 encoding."""
        if not text: return ""
        # Replace common incompatible characters
        replacements = {
            '\u2013': '-',  # en-dash
            '\u2014': '-',  # em-dash
            '\u2018': "'",  # left single quote
            '\u2019': "'",  # right single quote
            '\u201c': '"',  # left double quote
            '\u201d': '"',  # right double quote
            '\u2022': '-',  # bullet
        }
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
            
        # Final safety net: encode to latin-1, replacing errors
        return str(text).encode('latin-1', 'replace').decode('latin-1')

    def header_section(self, data):
        self.set_font("Times", "B", 24)
        name = data.get("name", "Name")
        if not name: name = "Name"
        self.cell(0, 10, self.sanitize(name).upper(), align="C", ln=True)
        
        self.set_font("Times", "", 10)
        parts = [data.get("email"), data.get("phone"), data.get("linkedin")]
        contact = " | ".join([p for p in parts if p])
        self.cell(0, 5, self.sanitize(contact), align="C", ln=True)
        self.ln(5)

    def section_title(self, title):
        self.set_font("Times", "B", 12)
        self.cell(0, 6, self.sanitize(title).upper(), ln=True)
        self.line(self.get_x(), self.get_y(), 190, self.get_y())
        self.ln(2)

    def add_education(self, edu_list):
        if not edu_list: return
        self.section_title("Education")
        for item in edu_list:
            self.set_font("Times", "B", 11)
            self.cell(100, 5, self.sanitize(item.get("school", "")), align="L")
            self.set_font("Times", "", 11)
            self.cell(0, 5, self.sanitize(item.get("location", "")), align="R", ln=True)
            self.set_font("Times", "I", 11)
            self.cell(100, 5, self.sanitize(item.get("degree", "")), align="L")
            self.set_font("Times", "", 11)
            self.cell(0, 5, self.sanitize(item.get("date", "")), align="R", ln=True)
            self.ln(3)

    def add_experience(self, exp_list):
        if not exp_list: return
        self.section_title("Experience")
        for item in exp_list:
            self.set_font("Times", "B", 11)
            self.cell(100, 5, self.sanitize(item.get("company", "")), align="L")
            self.set_font("Times", "", 11)
            self.cell(0, 5, self.sanitize(item.get("location", "")), align="R", ln=True)
            self.set_font("Times", "I", 11)
            self.cell(100, 5, self.sanitize(item.get("role", "")), align="L")
            self.set_font("Times", "", 11)
            self.cell(0, 5, self.sanitize(item.get("date", "")), align="R", ln=True)
            
            self.set_font("Times", "", 10)
            for bullet in item.get("bullets", []):
                safe_bullet = self.sanitize(bullet)
                self.cell(5) 
                self.cell(3)
                self.multi_cell(0, 5, f"- {safe_bullet}")
            self.ln(4)

    def add_skills(self, skills_text):
        if not skills_text: return
        self.section_title("Skills")
        self.set_font("Times", "", 10)
        # Handle string vs list
        if isinstance(skills_text, list):
            skills_text = ", ".join(skills_text)
        
        safe_text = self.sanitize(skills_text)
        self.multi_cell(0, 5, safe_text)
        self.ln(5)

def generate_improved_pdf(data: dict, output_path: str, template_id: str = "professional"):
    """
    Generate ATS-optimized PDF resume using FPDF and Harvard style.
    """
    try:
        logger.info(f"Generating PDF at: {output_path}")
        
        pdf = HarvardPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Safely get data with defaults
        if "header" in data: pdf.header_section(data["header"])
        if "education" in data: pdf.add_education(data["education"])
        if "experience" in data: pdf.add_experience(data["experience"])
        if "skills" in data: pdf.add_skills(data["skills"])
        
        pdf.output(output_path)
        logger.info("✓ PDF generated successfully")
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise Exception(f"Error generating PDF: {str(e)}")
