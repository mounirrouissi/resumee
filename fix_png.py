from PIL import Image
import os

try:
    # Open the mislabeled file
    img = Image.open("assets/images/logo.png")
    print(f"Original format: {img.format}")
    
    # Save as actual PNG
    img.save("assets/images/logo.png", "PNG")
    print("Converted to PNG successfully")
    
    # Verify
    img_check = Image.open("assets/images/logo.png")
    print(f"New format: {img_check.format}")
    
except Exception as e:
    print(f"Error converting: {e}")
