import os
import requests
from app.utils import LANG_CODE_TO_NAME

MEMBER2_BASE_URL = os.getenv("MEMBER2_BASE_URL","http://localhost:5000")


def get_explanation_from_llm(topic: str) -> dict:
    """
    Calls Member 2's LLM /explain endpoint.
    Always requests English, since that's our translation source language.
    Returns a dict with 'simple', 'steps', 'analogy' — or a safe fallback on failure.
    """
    payload = {"topic": topic, "language": "English"}

    try:
        response = requests.post(f"{MEMBER2_BASE_URL}/explain", json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        # Member 2's server might be down/not started yet — fail safely
        return {
            "simple": f"[Error: could not reach explanation service - {e}]",
            "steps": [],
            "analogy": "",
        }