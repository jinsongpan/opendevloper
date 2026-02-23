from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from pydantic import BaseModel
from .postgres_saver import CheckpointManager, get_checkpoint_manager

router = APIRouter(prefix="/api/checkpoints", tags=["checkpoints"])


class ThreadListResponse(BaseModel):
    threads: List[dict]
    total: int


class CheckpointResponse(BaseModel):
    checkpoint_id: str
    ts: str
    channel_values: dict
    metadata: Optional[dict] = None


class HistoryItem(BaseModel):
    checkpoint_id: str
    ts: str
    channel_values: dict
    metadata: Optional[dict] = None


@router.get("/threads", response_model=ThreadListResponse)
async def list_threads(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    threads = await manager.list_threads(limit, offset)
    return {"threads": threads, "total": len(threads)}


@router.get("/threads/{thread_id}")
async def get_thread(
    thread_id: str,
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    history = await manager.get_thread_history(thread_id)
    if not history:
        raise HTTPException(status_code=404, detail="Thread not found")
    return {"thread_id": thread_id, "checkpoints": history}


@router.get("/threads/{thread_id}/history")
async def get_thread_history(
    thread_id: str,
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    history = await manager.get_thread_history(thread_id)
    return {"thread_id": thread_id, "history": history}


@router.get("/threads/{thread_id}/checkpoints/{checkpoint_id}")
async def get_checkpoint(
    thread_id: str,
    checkpoint_id: str,
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    checkpoint = await manager.get_checkpoint(thread_id, checkpoint_id)
    if not checkpoint:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    return checkpoint


@router.get("/threads/{thread_id}/latest")
async def get_latest_checkpoint(
    thread_id: str,
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    checkpoint = await manager.get_latest_checkpoint(thread_id)
    if not checkpoint:
        raise HTTPException(status_code=404, detail="No checkpoint found for thread")
    return checkpoint


@router.delete("/threads/{thread_id}")
async def delete_thread(
    thread_id: str,
    manager: CheckpointManager = Depends(get_checkpoint_manager)
):
    await manager.delete_thread(thread_id)
    return {"success": True}
