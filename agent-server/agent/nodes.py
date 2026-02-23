from langchain_core.messages import HumanMessage, AIMessage
from .state import AgentState


def process_input(state: AgentState) -> AgentState:
    messages = state.get("messages", [])
    if not messages:
        return state
    
    last_message = messages[-1]
    if isinstance(last_message, HumanMessage):
        return {
            **state,
            "execution_status": "processing"
        }
    return state


def generate_response(state: AgentState) -> AgentState:
    messages = state.get("messages", [])
    
    response_content = "我已经收到你的请求，正在处理中..."
    
    return {
        **state,
        "messages": messages + [AIMessage(content=response_content)],
        "execution_status": "completed"
    }


def execute_plan(state: AgentState) -> AgentState:
    plan_steps = state.get("plan_steps", [])
    current_step = state.get("current_step", 0)
    
    if current_step >= len(plan_steps):
        return {
            **state,
            "execution_status": "completed"
        }
    
    return {
        **state,
        "current_step": current_step + 1,
        "execution_status": "executing"
    }
