from typing import List, Dict, Any, Optional, Annotated
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class StatusLogEntry(TypedDict):
    timestamp: str
    node: str
    message: str
    detail: Optional[str]

class OpsCrewState(TypedDict):
    """
    Master Operational State schema with Human-in-the-Loop (HITL) gates,
    telemetry metrics, and security audit data.
    """
    # Chat / message history with automatic message reducer
    messages: Annotated[List[BaseMessage], add_messages]
    
    # User objective
    task: str
    
    # Node 1: Researcher output
    research_notes: str
    sources: List[str]
    
    # Node 2: DevSecOps Auditor output
    security_audit: str
    security_findings: List[str]
    security_risk_level: str  # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    
    # Node 3: Quality Evaluator decision & score
    quality_score: int         # 0 - 100
    is_research_sufficient: bool
    research_critique: str
    
    # Human-In-The-Loop (HITL) Gate
    require_approval: bool
    approval_status: str       # "NONE" | "AWAITING_APPROVAL" | "APPROVED" | "REJECTED"
    human_feedback: str
    
    # Node 4: Executive Writer output
    final_output: str
    
    # Execution metrics and lifecycle guardrails
    iteration_count: int
    max_iterations: int
    current_node: str
    status_logs: List[Dict[str, Any]]
    execution_metrics: Dict[str, Any]
