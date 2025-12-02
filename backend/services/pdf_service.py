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
        # Note: Simplified initialization for compatibility with newer PaddleOCR versions
        try:
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
        
        # Convert PDF to images with higher DPI for better quality
        images = convert_from_path(pdf_path, dpi=300)
        logger.info(f"Converted PDF to {len(images)} images at 300 DPI")
        
        ocr = get_paddle_ocr()
        all_text = []
        
        for i, image in enumerate(images):
            # Convert PIL image to numpy array
            img_array = np.array(image)
            
            # Preprocess image for better OCR (especially for resumes with watermarks, backgrounds)
            # Convert to grayscale for better text detection
            if len(img_array.shape) == 3:
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_array
            
            # Apply adaptive thresholding to improve text clarity
            # This helps with resumes that have background colors or watermarks
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Denoise the image
            denoised = cv2.fastNlMeansDenoising(binary, None, 10, 7, 21)
            
            # Try original image first (works better for clean PDFs)
            logger.info(f"Page {i+1}: Processing with original image...")
            try:
                result = ocr.ocr(img_array)
            except Exception as ocr_error:
                logger.warning(f"Page {i+1}: OCR error on original image: {str(ocr_error)}")
                result = None
            
            # If result is poor, try with preprocessed image
            if not result or not result[0] or len(result[0]) < 5:
                logger.info(f"Page {i+1}: Retrying with preprocessed image...")
                try:
                    result = ocr.ocr(denoised)
                except Exception as ocr_error:
                    logger.warning(f"Page {i+1}: OCR error on preprocessed image: {str(ocr_error)}")
                    result = None
            
            if result and result[0]:
                page_text = []
                
                # Sort by vertical position (top to bottom) then horizontal (left to right)
                # This helps maintain proper reading order in multi-column resumes
                sorted_lines = sorted(result[0], key=lambda x: (x[0][0][1], x[0][0][0]))
                
                for line in sorted_lines:
                    if line[1][0]:  # text content
                        text = line[1][0].strip()
                        confidence = line[1][1]
                        
                        # Only include text with reasonable confidence (>0.5)
                        if confidence > 0.5:
                            page_text.append(text)
                        else:
                            logger.debug(f"Skipped low-confidence text: {text} (confidence: {confidence:.2f})")
                
                page_content = '\n'.join(page_text)
                all_text.append(page_content)
                logger.info(f"Page {i+1}: Extracted {len(page_content)} characters ({len(page_text)} lines)")
            else:
                logger.warning(f"Page {i+1}: No text detected")
        
        extracted = '\n\n'.join(all_text)
        logger.info(f"PaddleOCR extraction complete. Total: {len(extracted)} characters")
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
            
            # Try Tesseract for scanned PDFs
            logger.info("BACKUP METHOD: Attempting Tesseract OCR...")
            text, success = extract_text_with_tesseract(pdf_path)
            if success and text.strip():
                ocr_method_used = "Tesseract OCR"
                extracted_text = text
                logger.info("✓ Tesseract OCR succeeded!")
            else:
                logger.warning("✗ Tesseract failed or returned empty text")
                
                # Try PaddleOCR as final fallback
                logger.info("FALLBACK METHOD: Attempting PaddleOCR (for scanned PDFs)...")
                text, success = extract_text_with_paddle_ocr(pdf_path)
                if success and text.strip():
                    ocr_method_used = "PaddleOCR"
                    extracted_text = text
                    logger.info("✓ PaddleOCR succeeded!")
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

def generate_improved_pdf(text: str, output_path: str, template_id: str = "professional"):
    """
    Generate ATS-optimized PDF resume following professional standards.
    Uses formatting markers if present, otherwise falls back to simple parsing.
    """
    try:
        from backend.services.templates import get_template
        from backend.services.pdf_formatter import generate_pdf_from_formatted_text, PDFFormatter
        
        logger.info(f"Generating PDF with template '{template_id}' at: {output_path}")
        template = get_template(template_id)
        template_styles = template.get_styles()
        
        # Log first part of text for debugging
        logger.info(f"First 500 chars of AI text: {text[:500]}")
        
        # Check if text has formatting markers
        formatter = PDFFormatter(template_styles)
        has_markers = formatter.has_formatting_markers(text)
        
        # Detailed marker detection logging
        logger.info("=" * 80)
        logger.info("MARKER DETECTION")
        logger.info("=" * 80)
        markers_to_check = ['[TITLE:', '[CONTACT:', '[SECTION:', '[SUBSECTION:', 
                           '[DATE:', '[BULLET:', '[PARAGRAPH]', '[SPACING]', '[BOLD:']
        for marker in markers_to_check:
            count = text.count(marker)
            if count > 0:
                logger.info(f"✓ Found {count} instances of {marker}")
            else:
                logger.info(f"✗ Missing: {marker}")
        logger.info("=" * 80)
        
        if has_markers:
            logger.info("✓ Using advanced PDF formatter with markers")
            generate_pdf_from_formatted_text(text, output_path, template_styles)
            return
        
        # No fallback - raise error if markers are missing
        logger.error("=" * 80)
        logger.error("❌ CRITICAL ERROR: NO FORMATTING MARKERS FOUND")
        logger.error("=" * 80)
        logger.error("The AI did not generate the required formatting markers.")
        logger.error("This indicates one of the following issues:")
        logger.error("  1. AI service is not working properly")
        logger.error("  2. AI is in simulation mode (check for API key issues)")
        logger.error("  3. System prompt is not being sent correctly")
        logger.error("")
        logger.error("Required markers: [TITLE:, [CONTACT:, [SECTION:, [BULLET:, etc.")
        logger.error("Check the debug file for the raw AI output.")
        logger.error("=" * 80)
        raise Exception(
            "PDF generation failed: AI did not generate required formatting markers. "
            "Please check the backend logs and ensure the AI service is configured correctly."
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise Exception(f"Error generating PDF: {str(e)}")
