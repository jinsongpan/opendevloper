from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from operator import add


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add]
    plan_steps: list
    current_step: int
    project_name: str
    sandbox_id: str | None
    execution_status: str
