import logging
import re
from typing import Final

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Keywords that should appear in the transformed text
KEYWORDS: Final[list[str]] = [
    "opinion",
    "market",
    "insight",
    "trend",
    "analysis",
]

# Regular expression patterns for tone adjustment
SENTENCE_END_RE: Final[re.Pattern] = re.compile(r"([.!?])\s+")
MULTIPLE_SPACES_RE: Final[re.Pattern] = re.compile(r"\s{2,}")


def _insert_keywords(text: str) -> str:
    """
    Insert missing keywords into the text while preserving original order.

    Args:
        text: Original text.

    Returns:
        Text with required keywords inserted if they were absent.
    """
    lowered = text.lower()
    missing = [kw for kw in KEYWORDS if kw not in lowered]
    if not missing:
        return text

    # Insert missing keywords at the end of the first sentence
    split = SENTENCE_END_RE.split(text, maxsplit=1)
    if len(split) >= 3:
        first_sentence = f"{split[0]}{split[1]}"
        remainder = split[2]
        insertion = " ".join(missing)
        transformed = f"{first_sentence} {insertion} {remainder}"
    else:
        insertion = " ".join(missing)
        transformed = f"{text} {insertion}"
    return transformed


def _adjust_tone(text: str) -> str:
    """
    Adjust the tone to be more engaging and authoritative for opinion‑market platforms.

    Args:
        text: Text after keyword insertion.

    Returns:
        Tone‑adjusted text.
    """
    # Replace weak verbs with stronger alternatives
    replacements = {
        r"\bthink\b": "believe",
        r"\bfeel\b": "perceive",
        r"\bsee\b": "observe",
        r"\blook\b": "examine",
        r"\btry\b": "endeavor",
    }
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # Ensure each sentence ends with a period if missing
    def _ensure_period(match: re.Match) -> str:
        sentence = match.group(0).strip()
        if not sentence.endswith((".", "!", "?")):
            return f"{sentence}."
        return sentence

    text = SENTENCE_END_RE.sub(_ensure_period, text)
    return text


def _clean_formatting(text: str) -> str:
    """
    Clean up whitespace and normalize formatting.

    Args:
        text: Text after tone adjustment.

    Returns:
        Formatted text.
    """
    text = MULTIPLE_SPACES_RE.sub(" ", text)
    return text.strip()


def transform_to_opinion_market(text: str) -> str:
    """
    Transform input text into a format suitable for opinion‑market platforms.

    The transformation includes:
    1. Inserting required keywords if they are missing.
    2. Adjusting tone to be more authoritative.
    3. Normalising whitespace and punctuation.

    Args:
        text: Raw input string.

    Returns:
        Transformed string ready for opinion‑market consumption.

    Raises:
        ValueError: If the input text is empty or not a string.
    """
    if not isinstance(text, str):
        logger.error("Invalid input type: %s", type(text))
        raise ValueError("Input must be a string.")
    if not text.strip():
        logger.error("Empty input received.")
        raise ValueError("Input text cannot be empty.")

    try:
        logger.debug("Starting transformation for text: %s", text)
        transformed = _insert_keywords(text)
        transformed = _adjust_tone(transformed)
        transformed = _clean_formatting(transformed)
        logger.debug("Transformation result: %s", transformed)
        return transformed
    except Exception as exc:
        logger.exception("Transformation failed: %s", exc)
        raise