# 1. Use 'bullseye' (Debian 11) for stability
FROM python:3.10-bullseye

# 2. Install System Dependencies
# ADDED: tesseract-ocr (Required for pytesseract)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# 3. Set work directory
WORKDIR /app

# 4. Install Python Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip

# Install PaddlePaddle CPU (Keep this only if you still use Paddle in some parts)
RUN pip install --no-cache-dir paddlepaddle==2.6.0 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/avx/stable.html

# Install the rest
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy App Code
COPY . .

# 6. Expose Port
EXPOSE 8000

# 7. Run Server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
