"""
Celery task definitions for background document processing.
"""

import os
from celery import Celery
from dotenv import load_dotenv

from .extractor import extract_text
from .nlp import analyze_document

load_dotenv()

# Configure Celery
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery("document_processor", broker=REDIS_URL, backend=REDIS_URL)

app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@app.task(name="process_document_task")
def process_document_task(file_name: str, file_type: str, file_base64: str):
    """
    Background task to extract text and run NLP analysis.
    """
    try:
        # 1. Extract text
        text = extract_text(file_type, file_base64)
        
        # 2. Run NLP pipeline
        analysis_results = analyze_document(text)
        
        # 3. Add file metadata
        analysis_results["fileName"] = file_name
        analysis_results["fileType"] = file_type
        
        return analysis_results
    except Exception as e:
        return {"error": str(e)}
