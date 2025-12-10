FROM python:3.9-slim

# 1. Install the system tools (Poppler & Graphics) that standard Python is missing
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libgl1-mesa-glx \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Set up the app
WORKDIR /app

# 3. Copy files and install Python libraries
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
# Install PaddlePaddle CPU version (smaller and faster for this)
RUN pip install --no-cache-dir paddlepaddle==2.6.0 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/avx/stable.html
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of the code
COPY . .

# 5. Open the door for internet traffic
EXPOSE 8000

# 6. Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]