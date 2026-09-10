# Common Telugu words written in Latin script (Tenglish)
TELUGU_ROMAN_WORDS = {
    "nenu", "meeru", "meeku", "naaku", "ela", "unnaru", "unnav", "cheyyi",
    "chesava", "chesanu", "bagunnara", "bagunnava", "ekkada", "enti",
    "emi", "kavali", "vachindi", "vellali", "chala", "bagundi", "ledu",
    "undi", "kaani", "sare", "ok", "ayindi", "chudu", "cheppu", "ra",
    "raa", "andi", "garu",
}

# Common Hindi words written in Latin script (Hinglish)
HINDI_ROMAN_WORDS = {
    "main", "aap", "kaise", "hain", "kya", "hai", "nahi", "kaha", "kahan",
    "acha", "accha", "theek", "thik", "karo", "kar", "raha", "rahi",
    "chahiye", "hoga", "gaya", "gayi", "bata", "batao", "yaar", "bhai",
    "kyun", "kyu", "matlab", "samajh",
}


def detect_mixed_language(text: str) -> str | None:
    """
    Checks if romanized text (Latin letters) actually contains
    Telugu or Hindi words written in English script (Tenglish/Hinglish).
    Returns 'te', 'hi', or None if no strong match found.
    """
    words = text.lower().replace(",", "").replace(".", "").replace("?", "").split()
    if not words:
        return None

    telugu_hits = sum(1 for w in words if w in TELUGU_ROMAN_WORDS)
    hindi_hits = sum(1 for w in words if w in HINDI_ROMAN_WORDS)

    # Require at least 1 match, and it should be a meaningful fraction of the text
    threshold = max(1, len(words) // 4)  # at least ~25% of words, min 1

    if telugu_hits >= threshold and telugu_hits >= hindi_hits:
        return "te"
    if hindi_hits >= threshold:
        return "hi"
    return None

# Mapping between our short codes and Member 2's LLM full language names
LANG_CODE_TO_NAME = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
}

NAME_TO_LANG_CODE = {v: k for k, v in LANG_CODE_TO_NAME.items()}