from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from typing import Optional
import os


class CheckpointManager:
    def __init__(self, db_uri: str):
        self.db_uri = db_uri
        self._pool: Optional[AsyncConnectionPool] = None
        self._saver: Optional[AsyncPostgresSaver] = None

    async def init(self):
        self._pool = AsyncConnectionPool(
            conninfo=self.db_uri,
            min_size=2,
            max_size=10,
            kwargs={"autocommit": True}
        )
        self._saver = AsyncPostgresSaver(self._pool)
        await self._saver.setup()
        print("[CheckpointManager] Initialized and tables created")

    def get_saver(self) -> AsyncPostgresSaver:
        if not self._saver:
            raise RuntimeError("CheckpointManager not initialized. Call init() first.")
        return self._saver

    async def list_threads(self, limit: int = 20, offset: int = 0) -> list:
        if not self._pool:
            return []
        async with self._pool.connection() as conn:
            rows = await conn.execute("""
                SELECT 
                    thread_id, 
                    MAX((checkpoint->>'ts')::timestamptz) as latest_ts, 
                    COUNT(*) as checkpoint_count
                FROM checkpoints
                GROUP BY thread_id
                ORDER BY latest_ts DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            results = await rows.fetchall()
            return [dict(r) for r in results]

    async def get_thread_history(self, thread_id: str) -> list:
        if not self._saver:
            return []
        config = {"configurable": {"thread_id": thread_id}}
        history = []
        async for checkpoint in self._saver.alist(config):
            history.append({
                "checkpoint_id": checkpoint.checkpoint["id"],
                "ts": checkpoint.checkpoint["ts"],
                "channel_values": checkpoint.checkpoint.get("channel_values", {}),
                "metadata": checkpoint.metadata,
            })
        return history

    async def get_checkpoint(self, thread_id: str, checkpoint_id: str) -> Optional[dict]:
        if not self._saver:
            return None
        config = {"configurable": {"thread_id": thread_id, "checkpoint_id": checkpoint_id}}
        checkpoint = await self._saver.aget(config)
        if not checkpoint:
            return None
        return {
            "checkpoint_id": checkpoint.checkpoint["id"],
            "ts": checkpoint.checkpoint["ts"],
            "channel_values": checkpoint.checkpoint.get("channel_values", {}),
            "metadata": checkpoint.metadata,
        }

    async def get_latest_checkpoint(self, thread_id: str) -> Optional[dict]:
        if not self._saver:
            return None
        config = {"configurable": {"thread_id": thread_id}}
        checkpoint = await self._saver.aget(config)
        if not checkpoint:
            return None
        return {
            "checkpoint_id": checkpoint.checkpoint["id"],
            "ts": checkpoint.checkpoint["ts"],
            "channel_values": checkpoint.checkpoint.get("channel_values", {}),
            "metadata": checkpoint.metadata,
        }

    async def delete_thread(self, thread_id: str):
        if self._saver:
            await self._saver.adelete_thread(thread_id)

    async def close(self):
        if self._pool:
            await self._pool.close()
            print("[CheckpointManager] Connection pool closed")


_db_uri = os.getenv("DATABASE_URL", "postgresql://agent:agent_password@localhost:5432/agent_db")
checkpoint_manager = CheckpointManager(_db_uri)


async def get_checkpoint_manager() -> CheckpointManager:
    return checkpoint_manager
