import cv2
import numpy as np
from paddleocr import PaddleOCR
from pdf2image import convert_from_path
import pytesseract
import PyPDF2
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
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
        _ocr_instance = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        logger.info("PaddleOCR initialized successfully")
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
            result = ocr.ocr(img_array, cls=True)
            
            # If result is poor, try with preprocessed image
            if not result or not result[0] or len(result[0]) < 5:
                logger.info(f"Page {i+1}: Retrying with preprocessed image...")
                result = ocr.ocr(denoised, cls=True)
            
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
        
        # Try PaddleOCR first (best for complex layouts and images)
        logger.info("PRIMARY METHOD: Attempting PaddleOCR...")
        text, success = extract_text_with_paddle_ocr(pdf_path)
        if success and text.strip():
            ocr_method_used = "PaddleOCR"
            extracted_text = text
            logger.info("✓ PaddleOCR succeeded!")
        else:
            logger.warning("✗ PaddleOCR failed or returned empty text")
            
            # Try Tesseract as backup
            logger.info("BACKUP METHOD: Attempting Tesseract OCR...")
            text, success = extract_text_with_tesseract(pdf_path)
            if success and text.strip():
                ocr_method_used = "Tesseract OCR"
                extracted_text = text
                logger.info("✓ Tesseract OCR succeeded!")
            else:
                logger.warning("✗ Tesseract OCR failed or returned empty text")
                
                # Try PyPDF2 as final fallback
                logger.info("FALLBACK METHOD: Attempting PyPDF2...")
                text, success = extract_text_with_pypdf2(pdf_path)
                if success and text.strip():
                    ocr_method_used = "PyPDF2 (Direct Text Extraction)"
                    extracted_text = text
                    logger.info("✓ PyPDF2 succeeded!")
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
    Uses simple, clean formatting that works with all ATS systems.
    """
    try:
        from backend.services.templates import get_template
        
        logger.info(f"Generating PDF with template '{template_id}' at: {output_path}")
        template = get_template(template_id)
        template_styles = template.get_styles()
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Use template styles
        name_style = template_styles['name']
        job_title_style = template_styles['job_title']
        contact_style = template_styles['contact']
        section_heading_style = template_styles['section_heading']
        body_style = template_styles['body']
        bullet_style = template_styles['bullet']
        divider_style = template_styles['divider']
        
        story = []
        lines = text.split('\n')
        logger.info(f"Processing {len(lines)} lines for ATS-optimized PDF")
        
        is_first_line = True
        is_second_line = False
        is_third_line = False
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Skip empty lines but add spacing
            if not line_stripped:
                story.append(Spacer(1, 0.08*inch))
                continue
            
            # Detect section dividers (lines with ━ characters)
            if '━' in line_stripped or '═' in line_stripped or '─' in line_stripped:
                # Replace with simple line for ATS compatibility
                story.append(Paragraph('_' * 80, divider_style))
                continue
            
            # First line should be the name (largest, bold)
            if is_first_line and not any(char in line_stripped for char in ['━', '═', '─']):
                story.append(Paragraph(line_stripped, name_style))
                is_first_line = False
                is_second_line = True
                continue
            
            # Second line could be job title
            if is_second_line and '|' not in line_stripped and not line_stripped.startswith('•'):
                story.append(Paragraph(line_stripped, job_title_style))
                is_second_line = False
                is_third_line = True
                continue
            
            # Third line is usually contact info (has pipes |)
            if is_third_line and '|' in line_stripped:
                story.append(Paragraph(line_stripped, contact_style))
                is_third_line = False
                continue
            
            # Section headings (all caps or specific keywords)
            if (line_stripped.isupper() and len(line_stripped) < 50 and 
                any(keyword in line_stripped for keyword in 
                    ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 
                     'PROJECTS', 'PROFESSIONAL', 'WORK', 'TECHNICAL'])):
                story.append(Paragraph(line_stripped, section_heading_style))
                continue
            
            # Bullet points
            if line_stripped.startswith('•') or line_stripped.startswith('-'):
                # Remove the bullet character, we'll add it with the style
                text_without_bullet = line_stripped[1:].strip()
                story.append(Paragraph(f'• {text_without_bullet}', bullet_style))
                continue
            
            # Job titles and company info (contains | separator)
            if '|' in line_stripped and any(keyword in line.lower() for keyword in 
                ['company', 'university', 'college', 'inc', 'llc', 'corp', 'location', '20', '19']):
                # This is likely a job/education header
                story.append(Paragraph(f'<b>{line_stripped}</b>', body_style))
                continue
            
            # Regular body text
            story.append(Paragraph(line_stripped, body_style))
        
        # Build the PDF
        doc.build(story)
        logger.info("ATS-optimized PDF generation successful")
        logger.info("PDF uses standard fonts (Helvetica) and clean formatting for maximum ATS compatibility")
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise Exception(f"Error generating PDF: {str(e)}")
