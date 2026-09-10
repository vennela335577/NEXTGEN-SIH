from langdetect import detect, LangDetectException
from app.utils import detect_mixed_language

# Unicode ranges for script-based detection (fast + reliable for Telugu/Hindi)
TELUGU_RANGE = (0x0C00, 0x0C7F)
DEVANAGARI_RANGE = (0x0900, 0x097F)  # Hindi

def detect_script(text: str) -> str | None:
    """
    Check character-by-character which script dominates the text.
    Returns 'te', 'hi', or None if mostly Latin/English characters.
    """
    telugu_count = 0
    hindi_count = 0

    for ch in text:
        code = ord(ch)
        if TELUGU_RANGE[0] <= code <= TELUGU_RANGE[1]:
            telugu_count += 1
        elif DEVANAGARI_RANGE[0] <= code <= DEVANAGARI_RANGE[1]:
            hindi_count += 1

    if telugu_count > 0 and telugu_count >= hindi_count:
        return "te"
    if hindi_count > 0:
        return "hi"
    return None


def detect_language(text: str) -> str:
    """
    Main detection function.
    1. First check script (handles native Telugu/Hindi text reliably).
    2. If no native script found, check for Tenglish/Hinglish word patterns.
    3. Fall back to langdetect (handles plain English).
    4. Default to English if detection fails.
    """
    if not text or not text.strip():
        return "en"

    script_result = detect_script(text)
    if script_result:
        return script_result

    mixed_result = detect_mixed_language(text)
    if mixed_result:
        return mixed_result

    try:
        result = detect(text)
        if result in ("te", "hi", "en"):
            return result
        return "en"  # unsupported language detected -> default to English for MVP
    except LangDetectException:
        return "en"