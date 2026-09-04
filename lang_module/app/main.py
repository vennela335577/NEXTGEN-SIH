from fastapi import FastAPI
from pydantic import BaseModel
from app.detector import detect_language
from app.translator import translate_text

app = FastAPI(title="Language Detection & Multilingual Handling")


class DetectRequest(BaseModel):
    text: str
    manual_language: str | None = None  # optional: user can force a language


class DetectResponse(BaseModel):
    detected_language: str
    source: str  # "manual" or "auto"


class TranslateRequest(BaseModel):
    text: str
    target_language: str  # "en", "te", or "hi"
    preserve_terms: list[str] | None = None  # technical terms to keep untranslated


class TranslateResponse(BaseModel):
    translated_text: str
    target_language: str


SUPPORTED_LANGUAGES = {"en", "te", "hi"}


@app.get("/")
def root():
    return {"status": "Language Detection module is running"}


@app.post("/detect-language", response_model=DetectResponse)
def detect_language_endpoint(request: DetectRequest):
    # Responsibility 2: support manual language selection
    if request.manual_language:
        lang = request.manual_language.lower()
        if lang in SUPPORTED_LANGUAGES:
            return DetectResponse(detected_language=lang, source="manual")
        # if invalid manual language, fall through to auto-detect

    # Responsibility 1: auto-detect student's language
    detected = detect_language(request.text)
    return DetectResponse(detected_language=detected, source="auto")


@app.post("/translate", response_model=TranslateResponse)
def translate_endpoint(request: TranslateRequest):
    if request.target_language not in SUPPORTED_LANGUAGES:
        return TranslateResponse(translated_text=request.text, target_language="en")

    translated = translate_text(
        request.text, request.target_language, request.preserve_terms
    )
    return TranslateResponse(
        translated_text=translated, target_language=request.target_language
    )