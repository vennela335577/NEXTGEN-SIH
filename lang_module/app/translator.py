import re
from deep_translator import GoogleTranslator

# Map our language codes to what deep-translator expects
LANG_CODE_MAP = {
    "en": "en",
    "te": "te",
    "hi": "hi",
}


def translate_text(text: str, target_language: str, preserve_terms: list[str] | None = None) -> str:
    """
    Translates text into the target language, while preserving given
    technical terms (Responsibility 6) exactly as-is.

    preserve_terms: list of words/phrases that should NOT be translated,
                    e.g. ["Photosynthesis", "Mitochondria"]
    """
    if not text or not text.strip():
        return text

    if target_language == "en":
        return text

    target = LANG_CODE_MAP.get(target_language)
    if not target:
        return text

    preserve_terms = preserve_terms or []

    # Step 1: replace each technical term with a unique placeholder (e.g. XTERM0X)
    placeholder_map = {}
    working_text = text
    for i, term in enumerate(preserve_terms):
        placeholder = f"XTERM{i}X"
        placeholder_map[placeholder] = term
        # replace whole-word matches only, case-insensitive
        working_text = re.sub(
            rf"\b{re.escape(term)}\b", placeholder, working_text, flags=re.IGNORECASE
        )

    # Step 2: translate the text (placeholders stay untouched — they look like random codes)
    try:
        translated = GoogleTranslator(source="en", target=target).translate(working_text)
        if not translated:
            translated = working_text
    except Exception:
        return text  # fail safely, return original if translation fails

    # Step 3: swap placeholders back with the original technical terms
    for placeholder, term in placeholder_map.items():
        # Google Translate sometimes changes placeholder casing/spacing, so match loosely
        translated = re.sub(placeholder, term, translated, flags=re.IGNORECASE)

    return translated