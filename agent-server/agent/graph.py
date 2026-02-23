from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.base import BaseCheckpointSaver
from .state import AgentState
from . import nodes


def create_graph(checkpointer: BaseCheckpointSaver | None = None):
    workflow = StateGraph(AgentState)
    
    workflow.add_node("process_input", nodes.process_input)
    workflow.add_node("generate_response", nodes.generate_response)
    workflow.add_node("execute_plan", nodes.execute_plan)
    
    workflow.add_edge(START, "process_input")
    workflow.add_edge("process_input", "generate_response")
    workflow.add_edge("generate_response", "execute_plan")
    workflow.add_edge("execute_plan", END)
    
    return workflow.compile(checkpointer=checkpointer)
