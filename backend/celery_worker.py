"""
Celery worker entry point.
Run with: `celery -A celery_worker.celery worker --loglevel=info`
"""

from src.tasks import app as celery

if __name__ == "__main__":
    celery.start()
