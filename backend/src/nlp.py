"""
NLP processing module.
- Summarization: HuggingFace BART/DistilBART (Fallback: Extractive)
- Named Entity Recognition: spaCy (Fallback: Regex)
- Sentiment Analysis: Pure Python keyword-based fallback.
"""

import logging
import re

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy-loaded global models (ISOLATED IMPORTS)
# ---------------------------------------------------------------------------
# We move ALL scientific imports inside these functions to prevent 
# process-level DLL crashes during server startup.

def _get_summarizer():
    try:
        from transformers import pipeline
        return pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=-1)
    except Exception:
        return None

def _get_spacy():
    try:
        import spacy
        return spacy.load("en_core_web_sm")
    except Exception:
        return None

# ---------------------------------------------------------------------------
# Summarization
# ---------------------------------------------------------------------------

def summarize(text: str) -> str:
    if not text or len(text.strip()) < 50:
        return text.strip() if text else ""

    # Try Transformer
    summarizer = _get_summarizer()
    if summarizer:
        try:
            res = summarizer(text[:4000], max_length=80, min_length=20)
            return res[0]["summary_text"]
        except Exception: pass

    # Fallback: Simple Extractive
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return " ".join(sentences[:2])

# ---------------------------------------------------------------------------
# NER (Regex)
# ---------------------------------------------------------------------------

def extract_entities(text: str) -> dict:
    entities = {"names": [], "dates": [], "organizations": [], "amounts": []}
    if not text: return entities

    # Try spaCy
    nlp = _get_spacy()
    if nlp:
        try:
            doc = nlp(text[:10000])
            for ent in doc.ents:
                if ent.label_ == "PERSON": entities["names"].append(ent.text)
                elif ent.label_ == "DATE": entities["dates"].append(ent.text)
                elif ent.label_ == "ORG": entities["organizations"].append(ent.text)
                elif ent.label_ == "MONEY": entities["amounts"].append(ent.text)
        except Exception: pass

    # Always add Regex results as enhancement/fallback
    from .utils import extract_currency_amounts, deduplicate
    entities["amounts"].extend(extract_currency_amounts(text))
    
    # Simple Orgs/Names Regex
    matches = re.findall(r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b', text)
    for m in matches:
        if any(kw in m.lower() for kw in ["corp", "inc", "ltd", "bank", "company"]):
            entities["organizations"].append(m)
        else:
            entities["names"].append(m)

    # Dedup
    for k in entities:
        entities[k] = deduplicate(entities[k])
        
    return entities

# ---------------------------------------------------------------------------
# Sentiment (Pure Python)
# ---------------------------------------------------------------------------

def analyze_sentiment(text: str) -> dict:
    if not text: return {"label": "Neutral", "score": 0.0}
    text_lower = text.lower()
    
    if sum(1 for kw in ["invoice", "receipt"] if kw in text_lower) >= 2:
        return {"label": "Neutral", "score": 0.0}

    # Try TextBlob
    try:
        from textblob import TextBlob
        blob = TextBlob(text[:5000])
        pol = blob.sentiment.polarity
        label = "Positive" if pol > 0.1 else "Negative" if pol < -0.1 else "Neutral"
        return {"label": label, "score": round(float(pol), 4)}
    except Exception:
        # Pure Python Keyword Fallback
        pos_words = {"good", "great", "excellent", "happy", "success"}
        neg_words = {"fail", "error", "bad", "issue", "problem"}
        words = re.findall(r'\w+', text_lower)
        pos = sum(1 for w in words if w in pos_words)
        neg = sum(1 for w in words if w in neg_words)
        score = (pos - neg) / max(1, pos + neg)
        label = "Positive" if score > 0.1 else "Negative" if score < -0.1 else "Neutral"
        return {"label": label, "score": round(float(score), 4)}

# ---------------------------------------------------------------------------
# Analysis Flow
# ---------------------------------------------------------------------------

def analyze_document(text: str) -> dict:
    return {
        "summary": summarize(text),
        "entities": extract_entities(text),
        "sentiment": analyze_sentiment(text),
    }
