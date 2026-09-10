import sys
import os

# allow tests to import from the app/ folder
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.detector import detect_language
from app.translator import translate_text


# ---------- Language Detection Tests ----------

def test_detect_english():
    assert detect_language("Hello, how are you?") == "en"


def test_detect_telugu_native_script():
    assert detect_language("నమస్తే మీరు ఎలా ఉన్నారు") == "te"


def test_detect_hindi_native_script():
    assert detect_language("नमस्ते आप कैसे हैं") == "hi"


def test_detect_tenglish():
    assert detect_language("meeku ela unnaru") == "te"


def test_detect_hinglish():
    assert detect_language("aap kaise hain") == "hi"


def test_detect_empty_text_defaults_to_english():
    assert detect_language("") == "en"


# ---------- Translation Tests ----------

def test_translate_english_to_telugu():
    result = translate_text("Hello", "te")
    assert result != "Hello"  # should be translated, not identical
    assert len(result) > 0


def test_translate_english_to_hindi():
    result = translate_text("Hello", "hi")
    assert result != "Hello"
    assert len(result) > 0


def test_translate_preserves_technical_term():
    result = translate_text(
        "Photosynthesis is the process by which plants make food",
        "te",
        preserve_terms=["Photosynthesis"],
    )
    assert "Photosynthesis" in result


def test_translate_target_english_returns_same_text():
    result = translate_text("Hello", "en")
    assert result == "Hello"


def test_translate_empty_text_returns_empty():
    assert translate_text("", "te") == ""