from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def verify_underline_support():
    style = getSampleStyleSheet()['Normal']
    try:
        # This should not raise an error if <u> is supported
        p = Paragraph("<u>Test</u>", style)
        print("ReportLab supports <u> tag.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_underline_support()
