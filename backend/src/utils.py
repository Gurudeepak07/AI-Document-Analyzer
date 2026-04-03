"""
Utility functions for text cleaning, truncation, and deduplication.
"""

import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Clean extracted text by normalizing unicode, removing control characters,
    and collapsing excessive whitespace while preserving paragraph breaks.
    """
    if not text:
        return ""

    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", text)

    # Remove control characters (keep newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

    # Replace tabs with spaces
    text = text.replace('\t', ' ')

    # Collapse multiple spaces into one (but preserve newlines)
    text = re.sub(r'[^\S\n]+', ' ', text)

    # Collapse 3+ consecutive newlines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)

    # Strip overall
    text = text.strip()

    return text


def truncate_text(text: str, max_chars: int = 4000) -> str:
    """
    Truncate text to a maximum character count.
    Tries to break at a sentence boundary for cleaner output.
    """
    if not text or len(text) <= max_chars:
        return text

    truncated = text[:max_chars]

    # Try to break at the last sentence-ending punctuation
    last_period = max(
        truncated.rfind('. '),
        truncated.rfind('.\n'),
        truncated.rfind('? '),
        truncated.rfind('! ')
    )

    if last_period > max_chars * 0.5:
        truncated = truncated[:last_period + 1]

    return truncated.strip()


def deduplicate(items: list) -> list:
    """
    Remove duplicates from a list while preserving order.
    Handles case-insensitive deduplication for strings.
    """
    if not items:
        return []

    seen = set()
    result = []
    for item in items:
        key = item.lower().strip() if isinstance(item, str) else item
        if key not in seen:
            seen.add(key)
            result.append(item.strip() if isinstance(item, str) else item)
    return result


def extract_currency_amounts(text: str) -> list:
    """
    Use regex to extract monetary amounts with various currency symbols.
    Handles: $, €, £, ₹, USD, INR, etc.
    """
    if not text:
        return []

    patterns = [
        # Symbol before amount: $1,234.56 or ₹1,23,456.78
        r'[$€£₹¥]\s?\d{1,3}(?:[,\s]\d{2,3})*(?:\.\d{1,2})?',
        # Amount before currency code: 1,234.56 USD
        r'\d{1,3}(?:[,\s]\d{2,3})*(?:\.\d{1,2})?\s?(?:USD|EUR|GBP|INR|JPY|CAD|AUD)',
        # Written out: Rs. 1,234 or Rs 1234
        r'(?:Rs\.?|INR)\s?\d{1,3}(?:[,\s]\d{2,3})*(?:\.\d{1,2})?',
    ]

    amounts = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        amounts.extend(matches)

    return deduplicate(amounts)
