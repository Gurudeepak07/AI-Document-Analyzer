"""
Main FastAPI application and API routes.
"""

import os
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Document Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from .env
API_KEY = os.getenv("API_KEY", "your-secret-api-key-here")
PROCESSING_MODE = os.getenv("PROCESSING_MODE", "sync").lower()

class DocumentAnalysisRequest(BaseModel):
    fileName: str
    fileType: str
    fileBase64: str

# API Key Dependency
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return x_api_key

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Document Analysis API is running"}

@app.post("/api/document-analyze")
async def analyze_document_endpoint(
    request: DocumentAnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Endpoint for analyzing a document.
    Categorizes and extracts text, then processes via AI.
    """
    if PROCESSING_MODE == "async":
        # Dispatches to Celery
        try:
            from .tasks import process_document_task
            task = process_document_task.delay(
                request.fileName, 
                request.fileType, 
                request.fileBase64
            )
            result = task.get(timeout=30)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Async processing error: {str(e)}")
    else:
        # Synchronous processing
        try:
            # Lazy imports to avoid DLL load failure on startup
            from .extractor import extract_text
            from .nlp import analyze_document
            
            # 1. Extract text
            text = extract_text(request.fileType, request.fileBase64)
            
            # 2. Run NLP pipeline
            analysis_results = analyze_document(text)
            
            # 3. Add file metadata
            analysis_results["fileName"] = request.fileName
            analysis_results["fileType"] = request.fileType
            
            return analysis_results
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            # Capture the DLL load failure specifically if it happens during execution
            err_msg = str(e)
            if "_umath_linalg" in err_msg:
                err_msg = "Scientific libraries (NumPy) are blocked by system policy. Falling back to limited analysis."
            raise HTTPException(status_code=500, detail=f"Analysis error: {err_msg}")
