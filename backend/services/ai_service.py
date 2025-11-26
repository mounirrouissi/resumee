import os
import google.generativeai as genai
import logging
from backend.services.templates import get_template

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

async def improve_resume_text(original_text: str, file_id: str = None, template_id: str = "professional") -> str:
    logger.info("=" * 80)
    logger.info("STARTING RESUME IMPROVEMENT PROCESS")
    logger.info("=" * 80)
    logger.info(f"File ID: {file_id}")
    logger.info(f"Template ID: {template_id}")
    logger.info(f"Original text length: {len(original_text)} characters")
    logger.info(f"Original text preview (first 200 chars): {original_text[:200]}")
    
    try:
        api_key = os.getenv("GEMINI_API_KEY", "")
        
        if not api_key:
            logger.warning("⚠️ No Gemini API key found, using simulation mode")
            improved = simulate_improvement(original_text)
            logger.info(f"Simulation result length: {len(improved)} characters")
            if file_id:
                save_improvement_analysis(original_text, improved, "Simulation mode - No API key", file_id)
            return improved
        
        logger.info("Initializing Gemini model...")
        # Use Gemini model - gemini-2.5-flash is the stable fast model
        model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash")
        logger.info(f"Using model: {model_name}")
        
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 8000,
            }
        )
        
        # First, get improvement suggestions in bullet points
        analysis_prompt = f"""Analyze this resume and provide a bullet-point list of the key improvements you will make.
Focus on:
- Grammar and language improvements
- Action verbs and stronger wording
- Clarity and conciseness enhancements
- ATS optimization suggestions
- Professional tone adjustments

Original Resume:
{original_text}

Provide ONLY a bullet-point list of specific improvements."""

        logger.info("📊 Step 1: Generating improvement analysis...")
        try:
            analysis_response = model.generate_content(analysis_prompt)
            improvement_suggestions = analysis_response.text if analysis_response else "No suggestions generated"
            logger.info(f"✓ Analysis complete. Suggestions length: {len(improvement_suggestions)} characters")
            logger.info(f"Suggestions preview: {improvement_suggestions[:200]}")
        except Exception as analysis_error:
            logger.error(f"✗ Analysis failed: {str(analysis_error)}")
            improvement_suggestions = f"Analysis failed: {str(analysis_error)}"
        
        # Get template-specific system prompt
        logger.info(f"📝 Step 2: Loading template '{template_id}'...")
        template = get_template(template_id)
        template_prompt = template.get_system_prompt()
        logger.info(f"✓ Template loaded. Prompt length: {len(template_prompt)} characters")
        
        # Then, get the improved resume
        prompt = f"{template_prompt}\n\nImprove this resume:\n\n{original_text}"
        logger.info(f"🚀 Step 3: Sending improvement request to Gemini...")
        logger.info(f"   Total prompt length: {len(prompt)} characters")
        logger.info(f"   Model: {model_name}")
        logger.info(f"   Temperature: 0.7")
        logger.info(f"   Max tokens: 8000")
        
        try:
            response = model.generate_content(prompt)
            logger.info("✓ Received response from Gemini")
            
            improved_text = response.text
            logger.info(f"✓ Improved text length: {len(improved_text) if improved_text else 0} characters")
            logger.info(f"   Original length: {len(original_text)} characters")
            logger.info(f"   Change: {len(improved_text) - len(original_text):+d} characters")
            logger.info(f"Improved text preview (first 300 chars):\n{improved_text[:300]}")
            
            # Check if text actually changed
            if improved_text.strip() == original_text.strip():
                logger.warning("⚠️ WARNING: Improved text is IDENTICAL to original text!")
                logger.warning("   This suggests the AI did not make any changes.")
            elif len(improved_text) < len(original_text) * 0.8:
                logger.warning("⚠️ WARNING: Improved text is significantly SHORTER than original!")
            else:
                logger.info("✓ Text was successfully improved")
                
        except Exception as improvement_error:
            logger.error(f"✗ Improvement request failed: {str(improvement_error)}")
            raise
        
        # Save improvement analysis to file
        if file_id:
            logger.info(f"💾 Saving improvement analysis to file...")
            save_improvement_analysis(original_text, improved_text, improvement_suggestions, file_id)
        
        final_text = improved_text.strip() if improved_text else original_text
        logger.info("=" * 80)
        logger.info("✓ RESUME IMPROVEMENT COMPLETED SUCCESSFULLY")
        logger.info(f"   Final text length: {len(final_text)} characters")
        logger.info("=" * 80)
        return final_text
        
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"✗ AI SERVICE ERROR: {str(e)}")
        logger.error("=" * 80)
        logger.error("Full error details:", exc_info=True)
        logger.warning("⚠️ Falling back to simulation mode...")
        
        improved = simulate_improvement(original_text)
        logger.info(f"Simulation result length: {len(improved)} characters")
        
        if file_id:
            save_improvement_analysis(original_text, improved, f"ERROR: {str(e)}\n\nFell back to simulation mode", file_id)
        
        logger.info("=" * 80)
        logger.warning("⚠️ COMPLETED WITH SIMULATION MODE (LIMITED IMPROVEMENTS)")
        logger.warning("   To get full Harvard CV formatting with AI:")
        logger.warning("   1. Get a new API key from https://makersuite.google.com/app/apikey")
        logger.warning("   2. Update .env file with new key")
        logger.warning("   3. Restart backend")
        logger.info("=" * 80)
        return improved

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
