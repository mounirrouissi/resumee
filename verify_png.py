import sys
from PIL import Image

try:
    img = Image.open("assets/images/logo.png")
    img.verify()
    print("Valid PNG")
    print(f"Format: {img.format}")
    print(f"Size: {img.size}")
    print(f"Mode: {img.mode}")
except Exception as e:
    print(f"Invalid PNG: {e}")
    sys.exit(1)
