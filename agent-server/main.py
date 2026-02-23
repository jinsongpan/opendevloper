#!/usr/bin/env python3
"""
AI Developer Agent Server
FastAPI-based agent service with checkpoint persistence
"""

import os
import sys
import signal
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from checkpoint.api import router as checkpoint_router
from checkpoint.postgres_saver import checkpoint_manager

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Agent Server] Starting up...")
    try:
        await checkpoint_manager.init()
        print("[Agent Server] Checkpoint manager initialized")
    except Exception as e:
        print(f"[Agent Server] Failed to initialize checkpoint manager: {e}")
    
    yield
    
    print("[Agent Server] Shutting down...")
    await checkpoint_manager.close()


app = FastAPI(
    title="Agent Server API",
    description="AI Developer Agent Server with checkpoint persistence",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkpoint_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/")
async def root():
    return {
        "name": "Agent Server API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "checkpoints": "/api/checkpoints"
        }
    }


def main():
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"Starting Agent Server on {host}:{port}...")
    
    def signal_handler(sig, frame):
        print("\nShutting down Agent Server...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    import uvicorn
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
