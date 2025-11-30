"""
PDF Formatter - Parses formatting markers and generates professional PDFs.
Handles structured text with markers like [TITLE: ...], [SECTION: ...], etc.
"""

import re
import logging
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)


class PDFFormatter:
    """Parses formatted text and generates professional PDFs."""
    
    def __init__(self, template_styles: Dict[str, ParagraphStyle]):
        """Initialize with template styles."""
        self.template_styles = template_styles
        self.parsed_elements = []
        
    def parse_formatted_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse text with formatting markers into structured data.
        
        Markers:
        - [TITLE: text]
        - [CONTACT: text]
        - [SECTION: text]
        - [SUBSECTION: text]
        - [DATE: text]
        - [BOLD: text]
        - [BULLET: text]
        - [PARAGRAPH]
        - [SPACING]
        """
        logger.info("Parsing formatted text with markers...")
        elements = []
        lines = text.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check for markers
            if line.startswith('[TITLE:'):
                match = re.match(r'\[TITLE:\s*(.*?)\]', line)
                if match:
                    elements.append({'type': 'title', 'content': match.group(1).strip()})
                    logger.debug(f"Found TITLE: {match.group(1).strip()}")
                    
            elif line.startswith('[CONTACT:'):
                match = re.match(r'\[CONTACT:\s*(.*?)\]', line)
                if match:
                    elements.append({'type': 'contact', 'content': match.group(1).strip()})
                    logger.debug(f"Found CONTACT: {match.group(1).strip()}")
                    
            elif line.startswith('[SECTION:'):
                match = re.match(r'\[SECTION:\s*(.*?)\]', line)
                if match:
                    elements.append({'type': 'section', 'content': match.group(1).strip()})
                    logger.debug(f"Found SECTION: {match.group(1).strip()}")
                    
            elif line.startswith('[SUBSECTION:'):
                match = re.match(r'\[SUBSECTION:\s*(.*?)\]', line)
                if match:
                    elements.append({'type': 'subsection', 'content': match.group(1).strip()})
                    logger.debug(f"Found SUBSECTION: {match.group(1).strip()}")
                    
            elif line.startswith('[DATE:'):
                match = re.match(r'\[DATE:\s*(.*?)\]', line)
                if match:
                    elements.append({'type': 'date', 'content': match.group(1).strip()})
                    logger.debug(f"Found DATE: {match.group(1).strip()}")
                    
            elif line.startswith('[BULLET:'):
                match = re.match(r'\[BULLET:\s*(.*?)\]', line)
                if match:
                    content = match.group(1).strip()
                    # Handle inline [BOLD: ] markers
                    content = self._process_inline_bold(content)
                    elements.append({'type': 'bullet', 'content': content})
                    logger.debug(f"Found BULLET: {content[:50]}...")
                    
            elif line.startswith('[PARAGRAPH]'):
                # Collect paragraph lines until next structural marker
                # Structural markers: [TITLE:, [CONTACT:, [SECTION:, [SUBSECTION:, [DATE:, [BULLET:, [SPACING]
                # Inline markers like [BOLD:] should NOT stop paragraph collection
                structural_markers = ['[TITLE:', '[CONTACT:', '[SECTION:', '[SUBSECTION:', 
                                     '[DATE:', '[BULLET:', '[SPACING]']
                para_lines = []
                i += 1
                while i < len(lines):
                    next_line = lines[i].strip()
                    # Stop if empty line or structural marker (but NOT [PARAGRAPH] or inline [BOLD:])
                    if not next_line:
                        break
                    if any(next_line.startswith(marker) for marker in structural_markers):
                        i -= 1  # Back up to process marker
                        break
                    # Include lines with [BOLD:] markers
                    para_lines.append(next_line)
                    i += 1
                
                if para_lines:
                    content = ' '.join(para_lines)
                    content = self._process_inline_bold(content)
                    elements.append({'type': 'paragraph', 'content': content})
                    logger.debug(f"Found PARAGRAPH: {content[:100]}...")
                    
            elif line.startswith('[SPACING]'):
                elements.append({'type': 'spacing'})
                logger.debug("Found SPACING")
                
            else:
                # Regular text without markers - treat as paragraph
                if line and not line.startswith('['):
                    content = self._process_inline_bold(line)
                    elements.append({'type': 'text', 'content': content})
            
            i += 1
        
        logger.info(f"Parsed {len(elements)} elements from formatted text")
        self.parsed_elements = elements
        return elements
    
    def _process_inline_bold(self, text: str) -> str:
        """Process inline [BOLD: text] markers and convert to HTML bold tags."""
        # Replace [BOLD: text] with <b>text</b>
        text = re.sub(r'\[BOLD:\s*(.*?)\]', r'<b>\1</b>', text)
        return text
    
    def generate_pdf(self, output_path: str, elements: List[Dict[str, Any]] = None):
        """Generate PDF from parsed elements."""
        if elements is None:
            elements = self.parsed_elements
        
        if not elements:
            raise ValueError("No elements to render. Call parse_formatted_text() first.")
        
        logger.info(f"Generating PDF with {len(elements)} elements...")
        logger.info(f"Output path: {output_path}")
        
        # Create PDF document with Harvard CV spec margins (20-25mm = 0.83 inch = 21mm)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,  # US Letter (8.5 × 11 in)
            rightMargin=0.83*inch,  # 21mm
            leftMargin=0.83*inch,
            topMargin=0.83*inch,
            bottomMargin=0.83*inch
        )
        
        story = []
        
        # Process each element
        for i, element in enumerate(elements):
            elem_type = element['type']
            content = element.get('content', '')
            
            logger.debug(f"Rendering element {i+1}/{len(elements)}: {elem_type}")
            
            if elem_type == 'title':
                # Title: Large, bold, centered (NO underline)
                para = Paragraph(content, self.template_styles['name'])
                story.append(para)
                story.append(Spacer(1, 0.05*inch))
                
            elif elem_type == 'contact':
                # Contact: Smaller, centered
                para = Paragraph(content, self.template_styles['contact'])
                story.append(para)
                
            elif elem_type == 'section':
                # Section header: Bold and underlined
                story.append(Spacer(1, 0.12*inch))
                # Use both underline tag AND HRFlowable for strong visual effect
                underlined_content = f'<b><u>{content.upper()}</u></b>'
                para = Paragraph(underlined_content, self.template_styles['section_heading'])
                story.append(para)
                # Add horizontal line below for extra emphasis
                story.append(Spacer(1, 0.03*inch))
                hr = HRFlowable(width="100%", thickness=1.5, color=colors.black, spaceBefore=0, spaceAfter=0)
                story.append(hr)
                story.append(Spacer(1, 0.1*inch))
                
            elif elem_type == 'subsection':
                # Subsection: Bold, medium size
                para = Paragraph(f'<b>{content}</b>', self.template_styles['body'])
                story.append(para)
                story.append(Spacer(1, 0.03*inch))
                
            elif elem_type == 'date':
                # Date: Regular, slightly smaller
                para = Paragraph(f'<i>{content}</i>', self.template_styles['body'])
                story.append(para)
                story.append(Spacer(1, 0.05*inch))
                
            elif elem_type == 'bullet':
                # Bullet point: Indented with bullet character
                para = Paragraph(f'• {content}', self.template_styles['bullet'])
                story.append(para)
                
            elif elem_type == 'paragraph':
                # Paragraph: Regular text
                para = Paragraph(content, self.template_styles['body'])
                story.append(para)
                story.append(Spacer(1, 0.05*inch))
                
            elif elem_type == 'text':
                # Plain text
                para = Paragraph(content, self.template_styles['body'])
                story.append(para)
                
            elif elem_type == 'spacing':
                # Add vertical space
                story.append(Spacer(1, 0.15*inch))
        
        # Build PDF
        try:
            doc.build(story)
            logger.info("✓ PDF generated successfully with formatting markers")
            logger.info(f"   Total elements rendered: {len(elements)}")
            logger.info(f"   Output file: {output_path}")
        except Exception as e:
            logger.error(f"✗ PDF generation failed: {str(e)}")
            raise
    
    def has_formatting_markers(self, text: str) -> bool:
        """Check if text contains formatting markers."""
        markers = ['[TITLE:', '[CONTACT:', '[SECTION:', '[SUBSECTION:', 
                   '[DATE:', '[BULLET:', '[PARAGRAPH]', '[SPACING]', '[BOLD:']
        return any(marker in text for marker in markers)


def generate_pdf_from_formatted_text(text: str, output_path: str, template_styles: Dict[str, ParagraphStyle]):
    """
    Main function to generate PDF from formatted text.
    
    Args:
        text: Text with formatting markers
        output_path: Where to save the PDF
        template_styles: Style definitions from template
    """
    logger.info("=" * 80)
    logger.info("PDF GENERATION FROM FORMATTED TEXT")
    logger.info("=" * 80)
    
    formatter = PDFFormatter(template_styles)
    
    # Check if text has markers
    if formatter.has_formatting_markers(text):
        logger.info("✓ Text contains formatting markers - using structured rendering")
        elements = formatter.parse_formatted_text(text)
        formatter.generate_pdf(output_path, elements)
    else:
        logger.warning("⚠️ No formatting markers found - falling back to simple rendering")
        # Fall back to simple rendering (existing method)
        from backend.services.pdf_service import generate_improved_pdf
        generate_improved_pdf(text, output_path, "professional")
    
    logger.info("=" * 80)
