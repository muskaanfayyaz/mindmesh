"""
main.py — MindMesh FastAPI Backend
"""
import os
from pathlib import Path

ENV_FILE = Path(__file__).parent / ".env"


def load_env_file():
    if not ENV_FILE.exists():
        return

    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            clean_value = value.strip().strip('"').strip("'")
            os.environ[key.strip()] = clean_value


load_env_file()

import json
import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents_orchestrator import run_pipeline, run_evolution_loop

DATA_DIR = Path(__file__).parent / "data"

app = FastAPI(title="MindMesh API", version="1.0.0")

allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
session_store: dict = {}  # user_id -> {strategy_history, last_result}
email_outbox: list[dict] = []


class InterestAdEmailRequest(BaseModel):
    user_id: str
    brand: str
    ad_id: str
    ad_name: str
    ad_copy: str
    genre: str
    slot: str


def get_user_email(user: dict):
    if user.get("email"):
        return user["email"]

    default_recipient = os.getenv("MINDMESH_DEFAULT_RECIPIENT")
    if default_recipient:
        return default_recipient

    safe_name = "-".join(user["name"].lower().split())
    return f"{safe_name}@mindmesh.demo"


def can_send_real_email(recipient: str):
    return (
        bool(os.getenv("MINDMESH_SMTP_USER"))
        and bool(os.getenv("MINDMESH_SMTP_PASSWORD"))
        and not recipient.endswith("@mindmesh.demo")
    )


def send_smtp_email(email_record: dict):
    smtp_host = os.getenv("MINDMESH_SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("MINDMESH_SMTP_PORT", "587"))
    smtp_user = os.getenv("MINDMESH_SMTP_USER")
    smtp_password = (os.getenv("MINDMESH_SMTP_PASSWORD") or "").replace(" ", "")
    sender = os.getenv("MINDMESH_SMTP_FROM", smtp_user or "")

    if not smtp_user or not smtp_password:
        raise RuntimeError("SMTP credentials are not configured")

    message = EmailMessage()
    message["From"] = sender
    message["To"] = email_record["to"]
    message["Subject"] = email_record["subject"]
    message.set_content(email_record["body"])

    context = ssl.create_default_context()
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls(context=context)
        server.login(smtp_user, smtp_password)
        server.send_message(message)

def load_users():
    with open(DATA_DIR / "users.json") as f:
        return json.load(f)

def get_user(user_id: str):
    users = load_users()
    user = next((u for u in users if u["user_id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


@app.get("/api/users")
def get_users(city: Optional[str] = None, device: Optional[str] = None, search: Optional[str] = None):
    users = load_users()
    if city:
        users = [u for u in users if u["city"].lower() == city.lower()]
    if device:
        users = [u for u in users if u["device"].lower() == device.lower()]
    if search:
        search = search.lower()
        users = [u for u in users if search in u["name"].lower() or search in u["primary_interest"].lower()]
    return {"users": users, "total": len(users)}


@app.get("/api/users/{user_id}")
def get_user_profile(user_id: str):
    return get_user(user_id)


@app.get("/api/stream/{user_id}")
async def stream_pipeline(user_id: str, brand: str = "ImagineArt"):
    user = get_user(user_id)
    
    async def event_generator():
        try:
            async for event in run_pipeline(user, brand):
                data = json.dumps(event)
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.05)
            
            # Store last result in session
            session_store.setdefault(user_id, {"strategy_history": [], "runs": 0})
            session_store[user_id]["runs"] = session_store[user_id].get("runs", 0) + 1
            
        except Exception as e:
            error_event = json.dumps({"step": "error", "data": {"message": str(e)}})
            yield f"data: {error_event}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


@app.get("/api/evolve/{user_id}")
async def evolve_strategy(user_id: str):
    user = get_user(user_id)
    session = session_store.get(user_id, {"strategy_history": []})
    
    async def evolution_generator():
        try:
            history = session.get("strategy_history", [])
            async for event in run_evolution_loop(user, history):
                data = json.dumps(event)
                yield f"data: {data}\n\n"
                await asyncio.sleep(0.05)
                
                # Accumulate history
                if event["step"] == "evolve":
                    session.setdefault("strategy_history", []).append(event["data"])
            
            session_store[user_id] = session
            
        except Exception as e:
            error_event = json.dumps({"step": "error", "data": {"message": str(e)}})
            yield f"data: {error_event}\n\n"
    
    return StreamingResponse(
        evolution_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


@app.get("/api/metrics/{user_id}")
def get_metrics(user_id: str):
    user = get_user(user_id)
    session = session_store.get(user_id, {"strategy_history": [], "runs": 0})
    return {
        "user_id": user_id,
        "user_name": user["name"],
        "baseline_ctr": user["click_through_rate"],
        "total_runs": session.get("runs", 0),
        "strategy_history": session.get("strategy_history", []),
        "last_strategy": user.get("last_strategy_used"),
        "last_strategy_success": user.get("last_strategy_success")
    }


@app.post("/api/send-interest-ad-email")
def send_interest_ad_email(payload: InterestAdEmailRequest):
    user = get_user(payload.user_id)
    recipient = get_user_email(user)
    email_record = {
        "to": recipient,
        "subject": f"{payload.brand}: {payload.ad_name}",
        "body": (
            f"Hi {user['name']},\n\n"
            f"We found a {payload.genre} offer for you: {payload.ad_name}.\n\n"
            f"{payload.ad_copy}\n\n"
            f"Best time: {payload.slot}\n"
            f"- {payload.brand}"
        ),
        "ad_id": payload.ad_id,
        "user_id": payload.user_id,
        "brand": payload.brand,
    }

    delivery = "outbox"
    smtp_error = None
    if can_send_real_email(recipient):
        try:
            send_smtp_email(email_record)
            delivery = "smtp"
        except Exception as e:
            smtp_error = str(e)

    email_outbox.append(email_record)
    session_store.setdefault(payload.user_id, {"strategy_history": [], "runs": 0})
    session_store[payload.user_id].setdefault("sent_ad_emails", []).append(email_record)
    return {
        "sent": delivery == "smtp",
        "delivery": delivery,
        "recipient": recipient,
        "ad_id": payload.ad_id,
        "smtp_error": smtp_error
    }


@app.get("/api/email-outbox")
def get_email_outbox():
    return {"emails": email_outbox, "total": len(email_outbox)}


@app.get("/api/cities")
def get_cities():
    users = load_users()
    cities = sorted(list(set(u["city"] for u in users)))
    return {"cities": cities}


@app.get("/health")
def health():
    return {"status": "ok", "service": "MindMesh API"}
