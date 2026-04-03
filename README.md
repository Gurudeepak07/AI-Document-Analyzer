# AI-Powered Document Analysis System

A production-ready full-stack application that analyzes documents (PDF, DOCX, Images) using state-of-the-art NLP models. 

## 🚀 Features

- **Multi-format Support**: PDF, DOCX, and Image (OCR) text extraction.
- **AI Summarization**: Generates concise 1-2 sentence summaries using HuggingFace Transformers (DistilBART).
- **Named Entity Recognition (NER)**: Automatically identifies Names, Dates, Organizations, and Monetary Amounts using spaCy and custom regex.
- **Sentiment Analysis**: Classifies document tone as Positive, Neutral, or Negative with business-document-specific fallback logic.
- **Async Processing**: Integrated with Celery & Redis for handling long-running AI tasks without blocking the API.
- **Modern UI**: Dark-themed, glassmorphism-based React frontend with drag-and-drop support.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Task Queue**: Celery + Redis
- **OCR**: Pytesseract (Tesseract OCR)
- **NLP**: 
  - `transformers` (Summarization)
  - `spacy` (NER)
  - `textblob` (Sentiment)
- **Document Parsing**: `pdfplumber`, `python-docx`

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Redis Server (for Async mode)
- **Tesseract OCR** installed on your system:
  - Windows: [Download here](https://github.com/UB-Mannheim/tesseract/wiki)
  - Linux: `sudo apt install tesseract-ocr`
  - macOS: `brew install tesseract`

---

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Create a `.env` file from `.env.example`:
```env
API_KEY=your-secret-api-key-here
REDIS_URL=redis://localhost:6379/0
PROCESSING_MODE=sync  # Use 'async' if Redis is running
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe  # Update path
```

Run the server:
```bash
uvicorn src.main:app --reload
```

(Optional) Run Celery worker:
```bash
celery -A celery_worker.celery worker --loglevel=info
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📖 API Usage

**Endpoint**: `POST /api/document-analyze`
**Headers**: `x-api-key: your-secret-api-key-here`

### Sample Request
```json
{
  "fileName": "invoice.pdf",
  "fileType": "pdf",
  "fileBase64": "data:application/pdf;base64,JVBER..."
}
```

### Sample Response
```json
{
  "summary": "This document is a service invoice from Acme Corp for consulting fees totaling $1,200.00.",
  "entities": {
    "names": ["John Doe"],
    "dates": ["March 25, 2024"],
    "organizations": ["Acme Corp"],
    "amounts": ["$1,200.00"]
  },
  "sentiment": {
    "label": "Neutral",
    "score": 0.0
  },
  "fileName": "invoice.pdf",
  "fileType": "pdf"
}
```

---

## 🧠 Approach

1. **Text Extraction**: Uses `pdfplumber` for digital PDFs, `python-docx` for Word files, and `pytesseract` for images and scanned documents.
2. **Preprocessing**: Text is cleaned of control characters and normalized to improve NLP model performance.
3. **Summarization**: Uses a `distilbart-cnn-12-6` model which provides a great balance between speed and accuracy.
4. **NER Pipeline**: Combined spaCy logic with custom Regex to capture currencies (₹, $, €, etc.) often missed by standard models.
5. **Aesthetics**: The UI follows modern design principles with subtle animations, gradient backgrounds, and a focus on clarity.

---

## 🧪 Deployment

- **Backend**: Can be deployed to Render or Railway. Set environment variables for Redis and Tesseract.
- **Frontend**: Deploy to Vercel or Netlify. Connect to the backend API via environment variables.

---

