"""
main.py — MindMesh FastAPI Backend
"""
import os
import json
import asyncio
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
session_store: dict = {}  # user_id -> {strategy_history, last_result}

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


@app.get("/api/cities")
def get_cities():
    users = load_users()
    cities = sorted(list(set(u["city"] for u in users)))
    return {"cities": cities}


@app.get("/health")
def health():
    return {"status": "ok", "service": "MindMesh API"}
