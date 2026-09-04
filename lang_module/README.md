# Language Detection & Multilingual Handling Module

**Team:** NEXTGEN (Team ID 277) — SIH 2026, PS 26205, Theme: Smart Education
**Module owner:** Member 3
**Branch:** `lang`

## What this module does

This module handles all language-related functionality for the AI-powered multilingual learning assistant:

1. Detects the student's language from their input text (English, Telugu, Hindi)
2. Supports manual language selection as an override
3. Handles mixed-language input (Tenglish, Hinglish)
4. Translates explanations into the student's chosen language
5. Preserves technical terms (e.g., topic names) untranslated during translation
6. Connects to Member 2's LLM service to fetch explanations and combines detection + translation into one pipeline

## Setup

```powershell
cd lang_module
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Running the server

```powershell
uvicorn app.main:app --reload
```

Server runs at `http://127.0.0.1:8000`. Interactive API docs: `http://127.0.0.1:8000/docs`

## Connecting to Member 2's LLM service

By default this module looks for Member 2's server at `http://localhost:5000`. To point it at a different URL (e.g., an ngrok tunnel), set the environment variable **before** starting the server:

```powershell
$env:MEMBER2_BASE_URL = "https://<their-ngrok-or-server-url>"
uvicorn app.main:app --reload
```

## API Endpoints

### `GET /`
Health check. Returns `{"status": "Language Detection module is running"}`.

### `POST /detect-language`
Detects the language of given text, or accepts a manual override.

**Request:**
```json
{
  "text": "నమస్తే మీరు ఎలా ఉన్నారు",
  "manual_language": null
}
```

**Response:**
```json
{
  "detected_language": "te",
  "source": "auto"
}
```

Supported languages: `en`, `te`, `hi`.

### `POST /translate`
Translates text into a target language, optionally preserving technical terms.

**Request:**
```json
{
  "text": "Mitochondria is the powerhouse of the cell",
  "target_language": "hi",
  "preserve_terms": ["Mitochondria"]
}
```

**Response:**
```json
{
  "translated_text": "Mitochondria कोशिका का पावरहाउस है",
  "target_language": "hi"
}
```

### `POST /learn`
Full pipeline: detects the student's language (or uses manual override), fetches an explanation from Member 2's LLM service, and returns it translated into the student's language with technical terms preserved.

**Request:**
```json
{
  "topic": "Photosynthesis",
  "student_text": "నాకు కిరణజన్య సంయోగక్రియ గురించి చెప్పు",
  "manual_language": null,
  "preserve_terms": ["Photosynthesis"]
}
```

**Response:**
```json
{
  "language": "te",
  "simple": "...",
  "steps": ["...", "..."],
  "analogy": "..."
}
```

If Member 2's LLM service is unreachable, this endpoint fails safely — it returns a translated error message instead of crashing.

## Project structure