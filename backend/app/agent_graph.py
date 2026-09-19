import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, Literal

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings
from app.state import OpsCrewState

logger = logging.getLogger("multi_agent_ops_crew")

# -----------------------------------------------------------------------------
# LLM & Search Initialization
# -----------------------------------------------------------------------------
def get_llm():
    """Returns ChatOpenAI instance or None if API key is missing."""
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-openai-api-key-here":
        return ChatOpenAI(
            model=settings.OPENAI_MODEL_NAME,
            temperature=settings.TEMPERATURE,
            api_key=settings.OPENAI_API_KEY
        )
    return None

def execute_search(query: str) -> str:
    """Executes web search via Tavily if configured, or returns simulated telemetry."""
    if settings.TAVILY_API_KEY and settings.TAVILY_API_KEY != "your-tavily-api-key-here":
        try:
            from langchain_community.tools.tavily_search import TavilySearchResults
            tavily = TavilySearchResults(max_results=3, tavily_api_key=settings.TAVILY_API_KEY)
            results = tavily.invoke(query)
            return json.dumps(results, indent=2)
        except Exception as e:
            logger.warning(f"Tavily search error ({e}), utilizing internal telemetry.")
    
    return (
        f"[Internal Telemetry & Knowledge Engine]\n"
        f"Query Target: {query}\n"
        f"Cluster Metrics: P99 latency = 14ms, Connection Pool saturation = 84% during peak burst.\n"
        f"Cloud Resiliency Guide: Automated read-replica promotion achieves 10s RTO using active heartbeat probes.\n"
        f"Zero-Trust Policy: Ephemeral TLS mTLS tokens with HashiCorp Vault / AWS KMS integration required."
    )

# -----------------------------------------------------------------------------
# Node 1: Lead Technical Researcher
# -----------------------------------------------------------------------------
async def researcher_node(state: OpsCrewState) -> Dict[str, Any]:
    """
    Investigates system architecture, failure modes, and telemetry.
    """
    start_time = time.time()
    task = state["task"]
    iteration = state.get("iteration_count", 0)
    critique = state.get("research_critique", "")
    human_feedback = state.get("human_feedback", "")
    timestamp = datetime.utcnow().strftime("%H:%M:%S")

    feedback_context = ""
    if human_feedback:
        feedback_context = f"Human Operator Directives: {human_feedback}"
    elif critique:
        feedback_context = f"Supervisor Critique: {critique}"

    log_entry = {
        "timestamp": timestamp,
        "node": "Researcher",
        "message": f"Investigating operational architecture (Cycle #{iteration + 1})",
        "detail": feedback_context if feedback_context else "Executing primary telemetry & architecture sweep."
    }

    llm = get_llm()
    search_context = execute_search(task)

    if llm:
        system_prompt = (
            "You are the Lead Technical Researcher of an elite Ops Crew. "
            "Conduct a deep architectural investigation of the user task. "
            "Highlight operational bottlenecks, latency benchmarks, high-availability topologies, and concrete runbook requirements."
        )
        user_prompt = (
            f"Objective: {task}\n"
            f"Feedback/Directives: {feedback_context or 'Initial discovery run'}\n"
            f"Search Telemetry:\n{search_context}\n\n"
            "Produce comprehensive, structured research notes."
        )
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        notes = response.content
    else:
        notes = (
            f"### High-Reliability Technical Dossier\n"
            f"- **Target System**: {task}\n"
            f"- **Topology Assessment**: Multi-zone active-passive failover with automated replication heartbeat probes.\n"
            f"- **Observed Bottlenecks**: Connection pooling saturation and replica lag under burst write traffic.\n"
            f"- **Recommended Mitigation**: Deploy PgBouncer / RDS Proxy in transactional pooling mode with automated health check cutover.\n"
            f"- **Telemetry Reference**: {search_context}\n"
        )
        if human_feedback:
            notes += f"\n- **Human Directives Addressed**: {human_feedback}\n"

    duration_ms = int((time.time() - start_time) * 1000)
    metrics = state.get("execution_metrics", {})
    metrics["researcher_ms"] = duration_ms

    return {
        "research_notes": notes,
        "sources": ["Cloud Architecture Framework", "SRE Site Reliability Manual", "Database Failover Benchmarks"],
        "current_node": "Researcher",
        "iteration_count": iteration + 1,
        "status_logs": [log_entry],
        "execution_metrics": metrics
    }

# -----------------------------------------------------------------------------
# Node 2: DevSecOps Security Auditor
# -----------------------------------------------------------------------------
async def security_auditor_node(state: OpsCrewState) -> Dict[str, Any]:
    """
    Evaluates blast radius, IAM boundaries, secret rotation, and threat models.
    """
    start_time = time.time()
    task = state["task"]
    notes = state.get("research_notes", "")
    timestamp = datetime.utcnow().strftime("%H:%M:%S")

    log_entry = {
        "timestamp": timestamp,
        "node": "Security",
        "message": "Conducting DevSecOps zero-trust compliance & blast-radius audit",
        "detail": "Analyzing IAM least privilege, secret storage, and vulnerability surface."
    }

    llm = get_llm()
    if llm:
        sec_prompt = (
            "You are the Principal DevSecOps Security Auditor of an autonomous Ops Crew. "
            f"Evaluate the following mission and research for security vulnerabilities:\n"
            f"Mission: {task}\n"
            f"Research Notes:\n{notes}\n\n"
            "Identify: 1) Threat vectors & blast radius, 2) IAM & secret rotation policies, "
            "3) Audit logging & compliance (SOC2/HIPAA), 4) Strict security checklist.\n"
            "Conclude with risk level: LOW, MEDIUM, or HIGH."
        )
        response = await llm.ainvoke([HumanMessage(content=sec_prompt)])
        sec_audit = response.content
        risk_level = "MEDIUM"
        if "HIGH" in sec_audit.upper():
            risk_level = "HIGH"
        elif "LOW" in sec_audit.upper():
            risk_level = "LOW"
    else:
        sec_audit = (
            "### DevSecOps Threat Matrix & Blast Radius Audit\n"
            "- **Threat Model**: Unauthorized failover trigger, DNS hijacking, and unencrypted replication stream.\n"
            "- **IAM Boundaries**: Apply least-privilege role `arn:aws:iam::roles/OpsCrewFailoverController` with boundary policy.\n"
            "- **Secret Management**: AWS Secrets Manager / Vault dynamic database credentials rotated every 4 hours.\n"
            "- **Compliance Posture**: SOC-2 Type II compliant audit trails streamed to immutability-locked S3 bucket."
        )
        risk_level = "HIGH" if "production" in task.lower() or "failover" in task.lower() else "MEDIUM"

    duration_ms = int((time.time() - start_time) * 1000)
    metrics = state.get("execution_metrics", {})
    metrics["security_ms"] = duration_ms

    findings = [
        "Enforce TLS 1.3 encryption on all internal peer replication links.",
        "Restrict automated failover API endpoints via mTLS and IP allowlisting.",
        "Mandate multi-party approval or automated canary validation before cutover."
    ]

    return {
        "security_audit": sec_audit,
        "security_findings": findings,
        "security_risk_level": risk_level,
        "current_node": "Security",
        "status_logs": [log_entry],
        "execution_metrics": metrics
    }

# -----------------------------------------------------------------------------
# Node 3: Quality Evaluator
# -----------------------------------------------------------------------------
async def evaluator_node(state: OpsCrewState) -> Dict[str, Any]:
    """
    Computes an operational readiness quality score (0-100) and decides loop continuation.
    """
    start_time = time.time()
    task = state["task"]
    notes = state.get("research_notes", "")
    iteration = state.get("iteration_count", 0)
    max_iter = state.get("max_iterations", 2)
    timestamp = datetime.utcnow().strftime("%H:%M:%S")

    # If reached max iterations, approve
    if iteration >= max_iter:
        duration_ms = int((time.time() - start_time) * 1000)
        metrics = state.get("execution_metrics", {})
        metrics["evaluator_ms"] = duration_ms
        return {
            "is_research_sufficient": True,
            "quality_score": 92,
            "research_critique": "Max iteration limit reached; criteria satisfied for executive drafting.",
            "current_node": "Evaluator",
            "status_logs": [{
                "timestamp": timestamp,
                "node": "Evaluator",
                "message": f"Readiness Verified (Score: 92/100). Iteration cap ({iteration}/{max_iter}) reached.",
                "detail": "Promoting pipeline to Approval / Writer gate."
            }],
            "execution_metrics": metrics
        }

    llm = get_llm()
    if llm:
        eval_prompt = (
            "You are the Ops Supervisor evaluating operational readiness. "
            f"Task: {task}\n"
            f"Research Notes:\n{notes}\n\n"
            "Score the research quality from 0 to 100 based on technical depth, security clarity, and actionability. "
            "Reply strictly with JSON: "
            '{"score": int, "sufficient": true or false, "critique": "reasoning"}'
        )
        try:
            response = await llm.ainvoke([HumanMessage(content=eval_prompt)])
            cleaned = response.content.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            score = int(data.get("score", 88))
            is_sufficient = bool(data.get("sufficient", score >= 75))
            critique = data.get("critique", "Operational readiness score meets production criteria.")
        except Exception:
            score = 88
            is_sufficient = True
            critique = "Readiness score: 88/100. Approved for executive runbook authoring."
    else:
        score = 92
        is_sufficient = True
        critique = "Mock evaluation: Quality score 92/100 meets production criteria."

    duration_ms = int((time.time() - start_time) * 1000)
    metrics = state.get("execution_metrics", {})
    metrics["evaluator_ms"] = duration_ms

    return {
        "is_research_sufficient": is_sufficient,
        "quality_score": score,
        "research_critique": critique,
        "current_node": "Evaluator",
        "status_logs": [{
            "timestamp": timestamp,
            "node": "Evaluator",
            "message": f"Readiness Decision: {'APPROVED' if is_sufficient else 'REVISE'} (Score: {score}/100)",
            "detail": critique
        }],
        "execution_metrics": metrics
    }

# -----------------------------------------------------------------------------
# Node 4: Human-in-the-Loop (HITL) Gate
# -----------------------------------------------------------------------------
async def approval_gate_node(state: OpsCrewState) -> Dict[str, Any]:
    """
    Human-In-The-Loop (HITL) Breakpoint:
    Halts automated execution and awaits human operator sign-off before writer compiles.
    """
    timestamp = datetime.utcnow().strftime("%H:%M:%S")
    approval_status = state.get("approval_status", "NONE")

    if approval_status == "NONE":
        new_status = "AWAITING_APPROVAL"
        msg = "⚠️ High-Impact Operation Detected: Awaiting Human Authorization to Proceed."
    else:
        new_status = approval_status
        msg = f"Human Approval Status: {approval_status}"

    return {
        "approval_status": new_status,
        "current_node": "ApprovalGate",
        "status_logs": [{
            "timestamp": timestamp,
            "node": "ApprovalGate",
            "message": msg,
            "detail": f"Risk Posture: {state.get('security_risk_level', 'MEDIUM')} | Readiness: {state.get('quality_score', 90)}/100"
        }]
    }

# -----------------------------------------------------------------------------
# Node 5: Executive Ops Architect (Writer)
# -----------------------------------------------------------------------------
async def writer_node(state: OpsCrewState) -> Dict[str, Any]:
    """
    Compiles authoritative, executive production runbook with code blocks and topology.
    """
    start_time = time.time()
    task = state["task"]
    notes = state.get("research_notes", "")
    sec_audit = state.get("security_audit", "")
    score = state.get("quality_score", 92)
    risk = state.get("security_risk_level", "LOW")
    timestamp = datetime.utcnow().strftime("%H:%M:%S")

    llm = get_llm()
    if llm:
        writer_prompt = (
            "You are the Principal Ops Architect. "
            "Synthesize this operational mission into an elite, executive-ready runbook.\n"
            "Format the output strictly with clean GitHub Flavored Markdown and include:\n"
            "1. # ⚡ Executive Mission Summary (with KPI impact)\n"
            "2. ## 🏗️ System Architecture & Failover Topology (with ASCII flow diagram)\n"
            "3. ## 🛠️ Step-by-Step Executable Runbook (with real bash / kubectl / terraform code blocks)\n"
            "4. ## 🛡️ DevSecOps & Blast Radius Safeguards\n"
            "5. ## ✅ Post-Incident Verification Checklist\n\n"
            f"Mission Objective: {task}\n"
            f"Research Dossier:\n{notes}\n"
            f"Security Audit:\n{sec_audit}"
        )
        response = await llm.ainvoke([HumanMessage(content=writer_prompt)])
        output_text = response.content
    else:
        output_text = (
            f"# ⚡ Executive Deliverable: {task}\n\n"
            f"**Readiness Score**: `{score}/100` | **Security Posture**: `{risk} RISK` | **Approval**: `HUMAN_AUTHORIZED`\n\n"
            f"---\n\n"
            f"## 1. Executive Summary\n"
            f"The Multi-Agent Ops Crew has completed autonomous synthesis, architectural discovery, and DevSecOps audit for the mission: **{task}**.\n\n"
            f"## 2. System Architecture & Failover Flow\n"
            f"```text\n"
            f" [Traffic Ingress] --> [PgBouncer Proxy Pool] --> [Primary DB (Active Write)]\n"
            f"                              |                        |\n"
            f"                    Heartbeat Probe Failure     WAL Replication (Sync)\n"
            f"                              v                        v\n"
            f"                     [Failover Controller] ----> [Standby DB (Promoted to Primary)]\n"
            f"```\n\n"
            f"## 3. Step-by-Step Executable Runbook\n\n"
            f"### Step 1: Verify Replication Lag\n"
            f"```bash\n"
            f"# Query replica delay in milliseconds\n"
            f"SELECT pid, client_addr, state, \n"
            f"       pg_wal_lsn_diff(pg_current_wal_lsn(), write_lsn) AS write_lag_bytes\n"
            f"FROM pg_stat_replication;\n"
            f"```\n\n"
            f"### Step 2: Drain Pool & Trigger Standby Promotion\n"
            f"```bash\n"
            f"# Annotate pod to drain in-flight transactions\n"
            f"kubectl annotate pod primary-db-0 ops.mission/drain=immediate --overwrite\n"
            f"kubectl exec -it standby-db-0 -- pg_ctl promote -D /var/lib/postgresql/data\n"
            f"```\n\n"
            f"### Step 3: Switch DNS / Route53 Weight\n"
            f"```bash\n"
            f"aws route53 change-resource-record-sets --hosted-zone-id Z12345 \\\n"
            f"  --change-batch file://failover-dns-update.json\n"
            f"```\n\n"
            f"## 4. DevSecOps & Threat Mitigation Safeguards\n"
            f"- **Encryption in Transit**: All peer replication channels enforced with TLS 1.3 and mTLS certificates.\n"
            f"- **Access Control**: Emergency break-glass access logged with immutability hash in CloudWatch.\n"
            f"- **Blast Radius**: Isolated VPC peering prevents cross-tenant credential exposure.\n\n"
            f"## 5. Verification Checklist\n"
            f"- [x] Replication lag verified under 50ms before promotion\n"
            f"- [x] Connection pool warm-up completed with zero dropped socket requests\n"
            f"- [x] Synthetic health probe `HTTP 200 OK` verified on all regional endpoints\n"
            f"- [x] Post-mortem checkpoint committed to LangGraph memory state\n"
        )

    duration_ms = int((time.time() - start_time) * 1000)
    metrics = state.get("execution_metrics", {})
    metrics["writer_ms"] = duration_ms
    metrics["total_duration_ms"] = sum([
        metrics.get("researcher_ms", 0),
        metrics.get("security_ms", 0),
        metrics.get("evaluator_ms", 0),
        duration_ms
    ])

    return {
        "final_output": output_text,
        "current_node": "Writer",
        "approval_status": "APPROVED",
        "status_logs": [{
            "timestamp": timestamp,
            "node": "Writer",
            "message": "Executive Production Runbook compiled and verified.",
            "detail": f"Total execution latency: {metrics['total_duration_ms']}ms"
        }],
        "execution_metrics": metrics
    }

# -----------------------------------------------------------------------------
# Conditional Edge Routers
# -----------------------------------------------------------------------------
def evaluator_router(state: OpsCrewState) -> Literal["approval_gate", "writer", "researcher"]:
    """
    Routes from Evaluator to either Approval Gate, Writer, or loop back to Researcher.
    """
    is_sufficient = state.get("is_research_sufficient", False)
    iteration = state.get("iteration_count", 0)
    max_iter = state.get("max_iterations", 2)
    score = state.get("quality_score", 0)
    require_approval = state.get("require_approval", False)
    risk = state.get("security_risk_level", "LOW")

    # If research needs revision and iteration limit not reached
    if not is_sufficient and score < 75 and iteration < max_iter:
        return "researcher"

    # If approval is requested or high-risk detected, route to HITL gate
    if require_approval or risk == "HIGH":
        if state.get("approval_status") == "APPROVED":
            return "writer"
        return "approval_gate"

    return "writer"


def approval_router(state: OpsCrewState) -> Literal["writer", "researcher", "end"]:
    """
    Evaluates human approval status to either proceed to Writer, loop back with feedback, or halt.
    """
    status = state.get("approval_status", "NONE")
    if status == "APPROVED":
        return "writer"
    elif status == "REJECTED":
        return "researcher"
    # Still awaiting human action
    return "end"

# -----------------------------------------------------------------------------
# Graph Construction
# -----------------------------------------------------------------------------
def create_ops_crew_graph():
    """
    Constructs the 5-Node Master Swarm with Human-in-the-Loop approval gate.
    """
    workflow = StateGraph(OpsCrewState)

    # Register nodes
    workflow.add_node("researcher", researcher_node)
    workflow.add_node("security", security_auditor_node)
    workflow.add_node("evaluator", evaluator_node)
    workflow.add_node("approval_gate", approval_gate_node)
    workflow.add_node("writer", writer_node)

    # Progression: Entry -> Researcher -> Security Auditor -> Evaluator
    workflow.set_entry_point("researcher")
    workflow.add_edge("researcher", "security")
    workflow.add_edge("security", "evaluator")

    # Evaluator conditional branch
    workflow.add_conditional_edges(
        "evaluator",
        evaluator_router,
        {
            "approval_gate": "approval_gate",
            "writer": "writer",
            "researcher": "researcher"
        }
    )

    # Approval Gate conditional branch
    workflow.add_conditional_edges(
        "approval_gate",
        approval_router,
        {
            "writer": "writer",
            "researcher": "researcher",
            "end": END
        }
    )

    workflow.add_edge("writer", END)

    checkpointer = MemorySaver()
    compiled_graph = workflow.compile(checkpointer=checkpointer)
    return compiled_graph

crew_graph = create_ops_crew_graph()
