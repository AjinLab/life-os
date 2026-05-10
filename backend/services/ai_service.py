import httpx
from backend.config import settings


async def call_groq(prompt: str, system_message: str = None) -> str:
    """Call Groq API for AI completions.
    
    Falls back gracefully if no API key is configured.
    """
    if not settings.GROQ_API_KEY:
        return _fallback_response(prompt)

    if system_message is None:
        system_message = (
            "You are Life OS AI Coach — a concise, supportive productivity assistant. "
            "Give actionable, specific advice. Keep responses under 200 words. "
            "Be warm but direct."
        )

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 500,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as e:
        return f"AI service error: {e.response.status_code}. Please check your GROQ_API_KEY."
    except Exception as e:
        return f"AI service unavailable: {str(e)}"


def _fallback_response(prompt: str) -> str:
    """Provide a helpful fallback when no API key is set."""
    if "briefing" in prompt.lower():
        return (
            "📋 Weekly Briefing (AI not configured)\n\n"
            "Set your GROQ_API_KEY in .env to enable AI-powered briefings. "
            "In the meantime, review your goals, check your habit streaks, "
            "and process any inbox captures."
        )
    elif "classify" in prompt.lower() or "capture" in prompt.lower():
        return '{"type": "task", "action": "Add to tasks", "reasoning": "AI not configured — defaulting to task."}'
    else:
        return (
            "AI Coach is not configured yet. Add GROQ_API_KEY to your .env file "
            "to enable AI-powered insights and summaries."
        )
