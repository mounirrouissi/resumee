
import os
from backend.services.pdf_formatter import generate_pdf_from_formatted_text
from backend.services.templates import get_template

def verify_formatting():
    # Sample text with new markers
    sample_text = """[TITLE: JOHN SMITH]
[CONTACT: Boston, MA • (555) 123-4567 • john.smith@email.com • linkedin.com/in/johnsmith]
[SPACING]
[SECTION: EDUCATION]
[EDUCATION_ITEM: Massachusetts Institute of Technology | Cambridge, MA | Bachelor of Science in Computer Science (GPA: 3.8/4.0) | September 2016 - May 2020]
[BULLET: Relevant coursework: Data Structures, Algorithms, Machine Learning, Artificial Intelligence]
[BULLET: Dean's List: Fall 2018, Spring 2019, Fall 2019]
[SPACING]
[SECTION: EXPERIENCE]
[EXPERIENCE_ITEM: Tech Company Inc. | Boston, MA | Software Engineer | June 2020 - Present]
[BULLET: Developed and deployed 5 full-stack web applications using React and Node.js, serving 10,000+ users]
[BULLET: Optimized database queries reducing load time by 40% and improving user experience]
[SPACING]
[SECTION: SKILLS]
[PARAGRAPH]
[BOLD: Technical:] JavaScript, Python, React, Node.js
"""

    output_path_base = os.path.join(os.getcwd(), "backend", "outputs")
    os.makedirs(output_path_base, exist_ok=True)
    output_path = os.path.join(output_path_base, "verify_formatting.pdf")
    
    # Get styles
    template = get_template("professional")
    styles = template.get_styles()
    
    print(f"Generating PDF to {output_path}...")
    try:
        generate_pdf_from_formatted_text(sample_text, output_path, styles)
        print("Verification PDF generated successfully!")
    except Exception as e:
        print(f"Error generating PDF: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_formatting()
