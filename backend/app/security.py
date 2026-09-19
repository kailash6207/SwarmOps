import re
import time
import logging
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("security")

# -----------------------------------------------------------------------------
# 1. Threat Pattern Detection & Prompt Sanitization (OWASP LLM01: Prompt Injection)
# -----------------------------------------------------------------------------
PROMPT_INJECTION_PATTERNS = [
    r"(?i)\bignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)\b",
    r"(?i)\breveal\s+(the\s+)?(system\s+prompt|secret|api\s*key|token|password)\b",
    r"(?i)\byou\s+are\s+now\s+(in\s+developer\s+mode|unrestricted|jailbroken|DAN)\b",
    r"(?i)<\s*script[^>]*>",
    r"(?i)\bexec\s*\(\s*['\"]",
    r"(?i)\b(eval|system|popen)\s*\(",
    r"(?i)(;|\||&&)\s*(rm\s+-rf|del\s+/f|format\s+[a-z]:)",
    r"(?i)\bdrop\s+table\b",
    r"(?i)\bunion\s+select\b",
]

THREAD_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")

def sanitize_user_prompt(prompt: str) -> str:
    """
    Sanitizes and bounds user input against prompt injection and malicious payloads.
    """
    if not prompt or not prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mission prompt cannot be empty."
        )

    # Length boundary limit to prevent Prompt Flooding / DoS
    clean_prompt = prompt.strip()
    if len(clean_prompt) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mission prompt exceeds maximum allowable length of 2,000 characters."
        )

    # Inspect against adversarial prompt injection heuristics
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, clean_prompt):
            logger.warning(f"Security Alert: Blocked suspicious payload matching pattern '{pattern}'")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security Guardrail Triggered: Disallowed prompt injection or adversarial tokens detected."
            )

    # Neutralize raw HTML script tags
    clean_prompt = clean_prompt.replace("<script>", "").replace("</script>", "")
    return clean_prompt


def validate_thread_id(thread_id: str) -> str:
    """
    Validates thread ID against path traversal and SQL injection characters.
    """
    if not THREAD_ID_REGEX.match(thread_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid thread_id format. Must be alphanumeric with hyphens or underscores (max 64 chars)."
        )
    return thread_id

# -----------------------------------------------------------------------------
# 2. Rate Limiting Middleware (DoS / Resource Exhaustion Protection)
# -----------------------------------------------------------------------------
class InMemoryRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding window rate limiter restricting clients to max requests per minute.
    """
    def __init__(self, app, max_requests: int = 45, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients: Dict[str, list] = {}

    async def dispatch(self, request: Request, call_next):
        # Exempt health checks from rate limiting
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown_client"
        current_time = time.time()

        # Clean old timestamps
        history = self.clients.get(client_ip, [])
        history = [ts for ts in history if current_time - ts < self.window_seconds]

        if len(history) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please wait 60 seconds before making additional requests.",
                    "ip": client_ip,
                    "retry_after_seconds": int(self.window_seconds - (current_time - history[0]))
                },
                headers={"Retry-After": str(self.window_seconds)}
            )

        history.append(current_time)
        self.clients[client_ip] = history

        response: Response = await call_next(request)
        return response

# -----------------------------------------------------------------------------
# 3. Security Headers Middleware (OWASP Secure Headers)
# -----------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Appends enterprise-grade HTTP security headers to every response.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), microphone=()"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        return response
