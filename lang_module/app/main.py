from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.detector import detect_language
from app.translator import translate_text
from app.connector import get_explanation_from_llm

app = FastAPI(title="Language Detection & Multilingual Handling")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectRequest(BaseModel):
    text: str
    manual_language: str | None = None


class DetectResponse(BaseModel):
    detected_language: str
    source: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    preserve_terms: list[str] | None = None


class TranslateResponse(BaseModel):
    translated_text: str
    target_language: str


class LearnRequest(BaseModel):
    topic: str
    student_text: str | None = None
    manual_language: str | None = None
    preserve_terms: list[str] | None = None


class LearnResponse(BaseModel):
    language: str
    simple: str
    steps: list[str]
    analogy: str


SUPPORTED_LANGUAGES = {"en", "te", "hi"}


@app.get("/")
def root():
    return {"status": "Language Detection module is running"}


@app.post("/detect-language", response_model=DetectResponse)
def detect_language_endpoint(request: DetectRequest):
    if request.manual_language:
        lang = request.manual_language.lower()
        if lang in SUPPORTED_LANGUAGES:
            return DetectResponse(detected_language=lang, source="manual")

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


@app.post("/learn", response_model=LearnResponse)
def learn_endpoint(request: LearnRequest):
    if request.manual_language and request.manual_language.lower() in SUPPORTED_LANGUAGES:
        language = request.manual_language.lower()
    elif request.student_text:
        language = detect_language(request.student_text)
    else:
        language = "en"

    explanation = get_explanation_from_llm(request.topic)

    preserve = request.preserve_terms or [request.topic]

    simple = translate_text(explanation.get("simple", ""), language, preserve)
    steps = [translate_text(s, language, preserve) for s in explanation.get("steps", [])]
    analogy = translate_text(explanation.get("analogy", ""), language, preserve)

    return LearnResponse(language=language, simple=simple, steps=steps, analogy=analogy)