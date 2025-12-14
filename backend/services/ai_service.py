import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from services.templates import get_template

# Thread pool for running blocking Gemini API calls
_executor = ThreadPoolExecutor(max_workers=4)

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")

SYSTEM_PROMPT = """You are an expert resume improvement assistant specialized in creating ATS-optimized, professional resumes.

CRITICAL FORMATTING REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATS OPTIMIZATION RULES (MUST FOLLOW):
1. Use ONLY standard fonts: Arial, Calibri, Helvetica, Times New Roman
2. NO photos, graphics, tables, text boxes, icons, or fancy fonts
3. Use simple text formatting with clear section headings
4. Reverse-chronological order (most recent first)
5. Include quantifiable achievements with metrics
6. Use strong action verbs
7. Keep sections clearly separated with visual dividers

RECRUITER PREFERENCES:
• Recruiters spend 6-10 seconds scanning resumes
• Clean layout with clear section headings
• Easy-to-locate information
• Career trajectory must be immediately visible

REQUIRED OUTPUT STRUCTURE ( only add if icluded in original resume )):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR FULL NAME
Target Job Title
City, Country | Phone | Email | linkedin.com/in/yourprofile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[3-4 sentences: professional identity + years of experience + top achievement with metrics + key skills]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORK EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Job Title | Company Name | Location | MM/YYYY - MM/YYYY
• [Action verb] + [what you did] + [result with number]
• [Action verb] + [what you did] + [result with number]
• [Action verb] + [what you did] + [result with number]

Previous Job Title | Company | Location | MM/YYYY - MM/YYYY
• [Achievement bullet with quantified impact]
• [Achievement bullet with quantified impact]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Degree, Major | University Name | Graduation Date

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Skill 1 | Skill 2 | Skill 3 | Skill 4 | Skill 5 | Skill 6

IMPROVEMENT GUIDELINES:
1. Preserve all factual information (names, dates, companies, education)
2. Use strong action verbs (Led, Developed, Achieved, Increased, etc.)
3. Quantify all achievements with numbers, percentages, or metrics
4. Improve clarity and conciseness
5. Maintain professional tone
6. Optimize for Applicant Tracking Systems (ATS)
7. Remove redundancies and filler words
8. Highlight key accomplishments with measurable impact
9. Use consistent formatting throughout
10. Ensure each bullet starts with an action verb

FORMATTING SPECIFICATIONS:
• Font Size: 10-12pt for body text
• Headings: 12-14pt, bold
• Margins: 0.5-1 inch
• Use pipe separators (|) not slashes or commas
• Section dividers: Use the exact line pattern shown above
• Date format: MM/YYYY - MM/YYYY or MM/YYYY - Present

WHAT TO AVOID:
❌ Photos or headshots
❌ Graphics, charts, or icons
❌ Tables or text boxes
❌ Multiple columns (complex layouts)
❌ Fancy fonts or colors
❌ Weak verbs (helped, worked on, responsible for)
❌ Vague statements without metrics
❌ Personal pronouns (I, me, my)
❌ Abbreviations without context

Return ONLY the improved resume text following the EXACT structure above with section dividers."""

import json

async def improve_resume_text(original_text: str, file_id: str = None, template_id: str = "professional") -> dict:
    logger.info("=" * 80)
    logger.info("STARTING RESUME IMPROVEMENT PROCESS (JSON MODE)")
    logger.info("=" * 80)
    logger.info(f"File ID: {file_id}")
    logger.info(f"Template ID: {template_id}")
    
    try:
        api_key = os.getenv("GEMINI_API_KEY", "")
        
        if not api_key:
            logger.warning("⚠️ No Gemini API key found, using simulation mode")
            # Simulation mode for JSON not fully implemented, returning basic structure
            return {
                "header": {"name": "Simulation User", "email": "sim@example.com"},
                "skills": "Simulation, Mode, Only"
            }
        
        logger.info("Initializing Gemini model...")
        model_name = os.getenv("LLM_MODEL", "gemini-1.5-flash")
        logger.info(f"Using model: {model_name}")
        
        # Configure model with JSON response type
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": 0.7,
                "response_mime_type": "application/json"
            }
        )
        
        prompt = f"""
        You are an expert Resume Writer. 
        1. Parse the following resume text.
        2. IMPROVE the content: Use strong action verbs, quantify results, fix grammar.
        3. Return a JSON Object with this exact schema:
        {{
            "header": {{ "name": "...", "email": "...", "phone": "...", "linkedin": "..." }},
            "education": [ {{ "school": "...", "degree": "...", "location": "...", "date": "..." }} ],
            "experience": [ {{ "company": "...", "role": "...", "location": "...", "date": "...", "bullets": ["...", "..."] }} ],
            "skills": "Skill 1, Skill 2, Skill 3"
        }}
        
        RAW TEXT:
        {original_text}
        """

        logger.info(f"🚀 Sending improvement request to Gemini...")
        
        # Run blocking API call in thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            _executor, model.generate_content, prompt
        )
        
        logger.info("✓ Received response from Gemini")
        
        # Parse JSON
        try:
            import json_repair
            data = json_repair.loads(response.text)
            logger.info("✓ JSON parsed successfully with json_repair")
        except Exception as e:
            logger.error(f"✗ JSON parsing failed even with json_repair: {str(e)}")
            logger.error(f"Raw response: {response.text[:500]}...") # Log first 500 chars
            raise ValueError(f"Failed to parse AI response: {str(e)}")

        # Save debug output
        if file_id:
            output_path = f"backend/outputs/{file_id}_data.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            logger.info(f"Debug JSON saved to: {output_path}")

        return data

    except Exception as e:
        logger.error(f"✗ AI SERVICE ERROR: {str(e)}", exc_info=True)
        raise

def save_improvement_analysis(original_text: str, improved_text: str, suggestions: str, file_id: str):
    """Save improvement analysis and suggestions to a file."""
    try:
        output_path = f"backend/outputs/{file_id}_improvements.txt"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("RESUME IMPROVEMENT ANALYSIS\n")
            f.write(f"File ID: {file_id}\n")
            f.write("=" * 80 + "\n\n")
            
            f.write("IMPROVEMENTS MADE:\n")
            f.write("-" * 80 + "\n")
            f.write(suggestions + "\n\n")
            
            f.write("=" * 80 + "\n")
            f.write("ORIGINAL TEXT\n")
            f.write("=" * 80 + "\n")
            f.write(original_text + "\n\n")
            
            f.write("=" * 80 + "\n")
            f.write("IMPROVED TEXT\n")
            f.write("=" * 80 + "\n")
            f.write(improved_text + "\n")
        
        logger.info(f"Improvement analysis saved to: {output_path}")
    except Exception as e:
        logger.error(f"Error saving improvement analysis: {str(e)}")


def simulate_improvement(text: str) -> str:
    logger.info("Running simulated improvement")
    lines = text.split('\n')
    improved_lines = []
    
    for line in lines:
        if not line.strip():
            improved_lines.append(line)
            continue
        
        improved_line = line
        
        replacements = {
            'responsible for': 'led',
            'worked on': 'developed',
            'helped': 'contributed to',
            'did': 'executed',
            'made': 'created',
            'used': 'utilized',
            'good': 'strong',
            'very': '',
        }
        
        for old, new in replacements.items():
            improved_line = improved_line.replace(old, new)
            improved_line = improved_line.replace(old.capitalize(), new.capitalize())
        
        improved_lines.append(improved_line)
    
    return '\n'.join(improved_lines)
