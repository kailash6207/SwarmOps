"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download,
  Activity,
  Database,
  Radio,
  FileText,
  Sun,
  Moon,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Award,
  Volume2,
  VolumeX,
  Clock,
  ListTodo,
  FileJson,
  Mic,
  MicOff,
  Network,
  PlayCircle,
  AlertTriangle,
  UserCheck,
  Server,
  Workflow,
  Lock,
  Flame,
  MessageSquare,
  Send,
  Bot,
  User,
  Cloud,
  Code2,
  FileCode,
  DollarSign,
  History,
  GitCompare,
  Gauge,
  TrendingDown
} from "lucide-react";

interface StatusLog {
  timestamp: string;
  node: string;
  message: string;
  detail?: string;
}

interface CrewState {
  threadId: string;
  task: string;
  finalOutput: string;
  researchNotes: string;
  sources: string[];
  securityAudit: string;
  securityFindings: string[];
  securityRiskLevel: string;
  qualityScore: number;
  approvalStatus: string;
  iterationCount: number;
  executionMetrics: Record<string, any>;
}

const PRESET_TASKS = [
  {
    title: "PostgreSQL 10s RTO Failover",
    desc: "AWS Multi-Region Aurora PostgreSQL Zero-Downtime Failover Strategy with PgBouncer connection pool draining."
  },
  {
    title: "Kubernetes Canary Promotion",
    desc: "Zero-Downtime EKS rolling upgrade with automated Flagger canary analysis and Prometheus health metrics."
  },
  {
    title: "Kafka Broker Partition Rebalance",
    desc: "Degraded cluster partition rebalancing runbook with zero data loss consumer checkpointing."
  },
  {
    title: "AI Swarm Zero-Trust Security Audit",
    desc: "Threat model and blast-radius mitigation audit for autonomous agent workers with dynamic Vault secret rotation."
  }
];

const CHAOS_SCENARIOS = [
  {
    title: "Split-Brain Partition",
    tag: "HA Split",
    icon: "💥",
    desc: "Simulate network partition between us-east-1a and us-east-1b with replication split-brain."
  },
  {
    title: "Ingress 85% SYN Flood",
    tag: "L7 DDoS",
    icon: "🌊",
    desc: "Simulate massive Layer-7 DDoS flood targeting API gateway with 85% socket saturation and 504 Gateway Timeouts."
  },
  {
    title: "Expired Wildcard Root CA",
    tag: "mTLS Void",
    icon: "🪪",
    desc: "Simulate emergency TLS handshake failures across all internal microservice mTLS links."
  },
  {
    title: "Zombie DB I/O Freeze",
    tag: "Deadlock",
    icon: "🛑",
    desc: "Simulate hung transactions holding exclusive table locks and starving the connection pool."
  }
];

export default function MasterOpsDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [threadId, setThreadId] = useState("");
  const [maxIterations, setMaxIterations] = useState(2);
  const [requireApproval, setRequireApproval] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [crewResult, setCrewResult] = useState<CrewState | null>(null);
  const [activeTab, setActiveTab] = useState<"runbook" | "topology" | "iac" | "rca" | "chat" | "security" | "research" | "console" | "json">("runbook");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [copied, setCopied] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logFilter, setLogFilter] = useState("");
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  // Chaos Engineering State
  const [activeChaos, setActiveChaos] = useState<string | null>(null);

  // Interrogate Swarm Chat State
  const [interrogateHistory, setInterrogateHistory] = useState<Array<{ id: string; sender: string; text: string; timestamp: string }>>([
    {
      id: "intro",
      sender: "Security",
      text: "DevSecOps Sentinel active. Interrogate any swarm node regarding blast-radius models, telemetry baselines, or readiness scores.",
      timestamp: "System Standby"
    }
  ]);
  const [interrogateInput, setInterrogateInput] = useState("");
  const [interrogateAgent, setInterrogateAgent] = useState<"Security" | "Researcher" | "Evaluator" | "Writer">("Security");
  const [isInterrogating, setIsInterrogating] = useState(false);

  // Multi-Cloud IaC Exporter State
  const [iacCloud, setIacCloud] = useState<"AWS" | "GCP" | "Azure">("AWS");
  const [iacFormat, setIacFormat] = useState<"terraform" | "ansible" | "bash">("terraform");
  const [iacCode, setIacCode] = useState<string>("");
  const [isGeneratingIaC, setIsGeneratingIaC] = useState(false);

  // RCA Post-Mortem State
  const [rcaData, setRcaData] = useState<{ mttr: string; estimated_cost: string; rca_markdown: string } | null>(null);
  const [isGeneratingRca, setIsGeneratingRca] = useState(false);
  const [rcaDuration, setRcaDuration] = useState<number>(14);

  // Topology Pre/Post Mode
  const [topologyMode, setTopologyMode] = useState<"pre" | "post">("post");

  // Human-in-the-Loop (HITL) State
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState("");
  const [isResuming, setIsResuming] = useState(false);

  // Sandbox simulation outputs
  const [sandboxOutputs, setSandboxOutputs] = useState<Record<string, { status: "running" | "success" | "error"; output: string }>>({});

  // Voice speech-to-text recognition
  const [isListening, setIsListening] = useState(false);


  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Web Audio Synthesizer
  const playChime = (freq: number = 587.33, type: OscillatorType = "sine", duration: number = 0.15) => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio suppression fallback
    }
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem("ops_crew_theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("ops_crew_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    setThreadId(`thread_${Math.random().toString(36).substring(2, 9)}`);
    checkBackendHealth();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (isProcessing) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isProcessing]);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/health`, { method: "GET" });
      if (res.ok) setBackendStatus("online");
      else setBackendStatus("offline");
    } catch {
      setBackendStatus("offline");
    }
  };

  const handleReset = () => {
    setThreadId(`thread_${Math.random().toString(36).substring(2, 9)}`);
    setPrompt("");
    setLogs([]);
    setActiveNode(null);
    setCompletedNodes([]);
    setCrewResult(null);
    setProgress(0);
    setAwaitingApproval(false);
    setChecklistState({});
    setSandboxOutputs({});
    setActiveChaos(null);
    setIacCode("");
    setRcaData(null);
  };

  const addLog = (node: string, message: string, detail?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, node, message, detail }]);
  };

  const downloadCustomFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerChaos = (scenario: typeof CHAOS_SCENARIOS[0]) => {
    setPrompt(scenario.desc);
    setActiveChaos(scenario.title);
    setRequireApproval(true);
    playChime(311.13, "sawtooth", 0.35);
    addLog("ChaosEngine", `CRITICAL FAULT INJECTED: [${scenario.tag}] ${scenario.title}`, scenario.desc);
  };

  const handleSendInterrogate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interrogateInput.trim() || isInterrogating) return;
    const q = interrogateInput.trim();
    const timeNow = new Date().toLocaleTimeString();
    setInterrogateInput("");
    setInterrogateHistory((prev) => [
      ...prev,
      { id: Math.random().toString(), sender: "Operator (You)", text: q, timestamp: timeNow }
    ]);
    setIsInterrogating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/threads/${threadId || "default"}/interrogate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: interrogateAgent.toLowerCase(), query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setInterrogateHistory((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: interrogateAgent, text: data.response, timestamp: data.timestamp }
        ]);
        playChime(659.25, "sine", 0.15);
      } else {
        setInterrogateHistory((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: interrogateAgent, text: "Swarm agent offline or state checkpoint not found.", timestamp: timeNow }
        ]);
      }
    } catch {
      setInterrogateHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: interrogateAgent, text: "Network error communicating with agent node.", timestamp: timeNow }
      ]);
    } finally {
      setIsInterrogating(false);
    }
  };

  const handleFetchIaC = async (cloud: "AWS" | "GCP" | "Azure", fmt: "terraform" | "ansible" | "bash") => {
    setIacCloud(cloud);
    setIacFormat(fmt);
    setIsGeneratingIaC(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/generate-iac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloud, format: fmt, mission: prompt || "Automated Regional Failover" })
      });
      if (res.ok) {
        const data = await res.json();
        setIacCode(data.code);
        playChime(523.25, "triangle", 0.12);
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingIaC(false);
    }
  };

  const handleFetchRca = async () => {
    setIsGeneratingRca(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/generate-rca`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission: prompt || "Critical Outage Mitigation", outage_duration_mins: rcaDuration })
      });
      if (res.ok) {
        const data = await res.json();
        setRcaData(data);
        playChime(587.33, "sine", 0.15);
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingRca(false);
    }
  };


  // Voice Mission Input
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      playChime(520, "sine", 0.1);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
      playChime(660, "sine", 0.15);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Human-in-the-Loop Resume
  const handleHumanDecision = async (action: "APPROVE" | "REJECT") => {
    setIsResuming(true);
    addLog("Operator", `Human Decision: ${action}`, approvalFeedback || "Direct Sign-Off");
    playChime(action === "APPROVE" ? 700 : 350, "triangle", 0.2);

    try {
      const res = await fetch(`${apiBaseUrl}/api/threads/${threadId}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          feedback: approvalFeedback
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errJson.detail || res.statusText);
      }

      const data = await res.json();
      setAwaitingApproval(false);
      setIsResuming(false);
      setIsProcessing(false);
      setActiveNode(null);
      setProgress(100);
      playChime(880, "sine", 0.3);

      setCrewResult({
        threadId: data.thread_id,
        task: data.task,
        finalOutput: data.final_output,
        researchNotes: data.research_notes,
        sources: data.sources || [],
        securityAudit: data.security_audit || "",
        securityFindings: data.security_findings || [],
        securityRiskLevel: data.security_risk_level || "LOW",
        qualityScore: data.quality_score || 92,
        approvalStatus: data.approval_status || "APPROVED",
        iterationCount: data.iteration_count,
        executionMetrics: data.execution_metrics || {}
      });

      addLog("System", "Human operator authorized cutover. Final deliverable compiled.");
    } catch (err: any) {
      setIsResuming(false);
      addLog("Error", `Resume failed: ${err.message}`);
    }
  };

  const executeWithStreaming = async () => {
    setIsProcessing(true);
    setProgress(10);
    setActiveNode("researcher");
    setCompletedNodes([]);
    setLogs([]);
    setCrewResult(null);
    setAwaitingApproval(false);
    setChecklistState({});
    playChime(440, "triangle", 0.12);

    addLog("System", `Deploying Hardened Swarm with HITL Gate (Thread: ${threadId})`);

    const streamUrl = `${apiBaseUrl}/api/stream-status?prompt=${encodeURIComponent(
      prompt
    )}&thread_id=${encodeURIComponent(threadId)}&max_iterations=${maxIterations}&require_approval=${requireApproval}`;

    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener("crew_start", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      addLog("System", data.message || "Hardened Ops Swarm engaged.");
    });

    eventSource.addEventListener("node_update", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const nodeName = data.node;

      playChime(659.25, "sine", 0.15);
      setCompletedNodes((prev) => [...new Set([...prev, nodeName])]);
      setProgress(data.progress || 50);

      if (nodeName === "researcher") {
        setActiveNode("security");
      } else if (nodeName === "security") {
        setActiveNode("evaluator");
      } else if (nodeName === "evaluator") {
        setActiveNode(requireApproval ? "approval_gate" : "writer");
      } else if (nodeName === "approval_gate") {
        setActiveNode(null);
      } else if (nodeName === "writer") {
        setActiveNode(null);
      }

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((l: StatusLog) => addLog(l.node, l.message, l.detail));
      } else {
        addLog(nodeName.toUpperCase(), `Step verified. Preview: ${data.preview || "Done"}`);
      }
    });

    eventSource.addEventListener("awaiting_approval", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      playChime(493.88, "sawtooth", 0.35);
      addLog("SecurityGate", data.message, `Threat Posture: ${data.risk}`);
      setAwaitingApproval(true);
      setActiveNode("approval_gate");
      setProgress(85);
      eventSource.close();
    });

    eventSource.addEventListener("crew_complete", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      playChime(880, "sine", 0.3);
      addLog("System", "Ops Swarm reached END state. Runbook compiled.");
      setProgress(100);
      setCrewResult({
        threadId: data.thread_id,
        task: prompt,
        finalOutput: data.final_output,
        researchNotes: data.research_notes,
        sources: data.sources || [],
        securityAudit: data.security_audit || "",
        securityFindings: data.security_findings || [],
        securityRiskLevel: data.security_risk_level || "LOW",
        qualityScore: data.quality_score || 92,
        approvalStatus: data.approval_status || "APPROVED",
        iterationCount: 1,
        executionMetrics: data.execution_metrics || {}
      });
      setActiveNode(null);
      setIsProcessing(false);
      eventSource.close();
    });

    eventSource.addEventListener("crew_error", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      playChime(220, "sawtooth", 0.4);
      addLog("Error", `Security or execution error: ${data.error}`);
      setActiveNode(null);
      setIsProcessing(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      if (!awaitingApproval) {
        addLog("Error", "EventSource connection dropped. Check backend connectivity.");
        setIsProcessing(false);
        setActiveNode(null);
      }
      eventSource.close();
    };
  };

  const executeWithRest = async () => {
    setIsProcessing(true);
    setProgress(25);
    setActiveNode("researcher");
    setCompletedNodes([]);
    setLogs([]);
    setCrewResult(null);
    setAwaitingApproval(false);
    playChime(440, "triangle", 0.12);

    addLog("System", `Synchronous invocation /api/invoke-crew (Thread: '${threadId}')`);

    try {
      const res = await fetch(`${apiBaseUrl}/api/invoke-crew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          thread_id: threadId,
          max_iterations: maxIterations,
          require_approval: requireApproval
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errJson.detail || res.statusText);
      }

      const data = await res.json();
      playChime(880, "sine", 0.3);
      setCompletedNodes(["researcher", "security", "evaluator", "writer"]);
      setProgress(100);
      setActiveNode(null);

      if (data.status_logs) {
        data.status_logs.forEach((l: StatusLog) => addLog(l.node, l.message, l.detail));
      }

      setCrewResult({
        threadId: data.thread_id,
        task: data.task,
        finalOutput: data.final_output,
        researchNotes: data.research_notes,
        sources: data.sources || [],
        securityAudit: data.security_audit || "",
        securityFindings: data.security_findings || [],
        securityRiskLevel: data.security_risk_level || "LOW",
        qualityScore: data.quality_score || 92,
        approvalStatus: data.approval_status || "APPROVED",
        iterationCount: data.iteration_count,
        executionMetrics: data.execution_metrics || {}
      });
      addLog("System", "Master Swarm finished execution.");
    } catch (err: any) {
      playChime(220, "sawtooth", 0.4);
      addLog("SecurityAlert", `Execution intercepted: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setActiveNode(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    if (useStreaming) executeWithStreaming();
    else executeWithRest();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "md" | "json") => {
    if (!crewResult) return;
    let content = format === "md" ? crewResult.finalOutput : JSON.stringify(crewResult, null, 2);
    let mime = format === "md" ? "text/markdown" : "application/json";
    let ext = format === "md" ? "md" : "json";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ops-runbook-${crewResult.threadId}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSandbox = (stepKey: string, command: string) => {
    setSandboxOutputs((prev) => ({
      ...prev,
      [stepKey]: { status: "running", output: "Spinning up isolated sandbox container..." }
    }));
    playChime(500, "square", 0.1);

    setTimeout(() => {
      let outputText = "";
      if (command.includes("SELECT")) {
        outputText = "[Sandbox PostgreSQL Replica]\nlag_bytes: 0 | status: streaming | latency: 3.2ms\n[Verified]: Replica lag under 5ms. CUTOVER SAFE.";
      } else if (command.includes("kubectl")) {
        outputText = "[Sandbox Kubernetes EKS]\npod/primary-db-0 annotated ops.mission/drain=immediate\nwaiting for active connections to drain... done\nserver promoted to primary [OK]\nexit code: 0";
      } else {
        outputText = "[Sandbox AWS Route53 DNS]\nStatus: INSYNC (310ms)\nWeight updated to 100 on standby endpoint.\nDNS propagation verified across 14 edge locations.";
      }

      setSandboxOutputs((prev) => ({
        ...prev,
        [stepKey]: { status: "success", output: outputText }
      }));
      setChecklistState((prev) => ({ ...prev, [stepKey]: true }));
      playChime(780, "sine", 0.2);
    }, 1200);
  };

  const toggleChecklistItem = (item: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const isLight = theme === "light";
  const filteredLogs = logs.filter(
    (l) =>
      l.message.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.node.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isLight ? "bg-slate-100/70 text-slate-800" : "bg-[#080c14] text-slate-200"}`}>
      {/* Edge-to-Edge Navigation Header with Pink & Green Cyber Accents */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isLight ? "bg-white/95 border-slate-200 shadow-sm" : "bg-[#0d121f]/95 border-slate-800 shadow-lg"
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo with Pink & Green Gradient */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500 via-rose-500 to-emerald-500 rounded-xl shadow-md shadow-pink-500/25 text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-pink-600 to-emerald-600 dark:from-pink-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Multi-Agent Ops Crew
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  SHIELDED
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30">
                  HITL v3.1
                </span>
              </div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Hardened Autonomous Ops Swarm with OWASP Defense & Real-Time Telemetry
              </p>
            </div>
          </div>

          {/* Header Controls & Security Badges */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>WAF Guardrails: ACTIVE</span>
            </div>

            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
              <span>OWASP LLM01: SECURE</span>
            </div>

            {isProcessing && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 text-xs font-mono animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{elapsedSeconds}s elapsed</span>
              </div>
            )}

            {/* API Health Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300"
            }`}>
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === "online"
                    ? "bg-emerald-500 animate-pulse"
                    : backendStatus === "checking"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <span className="font-semibold uppercase text-[11px]">API: {backendStatus}</span>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                audioEnabled
                  ? isLight
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                  : isLight
                  ? "bg-slate-100 border-slate-300 text-slate-400"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
              title={`Audio feedback ${audioEnabled ? "Enabled" : "Disabled"}`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-pink-400"
              }`}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Human-in-the-Loop (HITL) Interactive Approval Modal */}
        {awaitingApproval && (
          <div className="w-full p-5 rounded-2xl border bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-emerald-500/15 border-pink-500/60 shadow-xl animate-pulse">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-gradient-to-tr from-pink-600 to-rose-600 text-white rounded-xl font-bold shadow-md shadow-pink-500/30">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                      Security Authorization Gate
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-700 dark:text-pink-300 font-mono font-bold border border-pink-500/40">
                      HIGH RISK OPERATION DETECTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                    DevSecOps zero-trust posture checks completed. Automated cutover, connection pool draining, and DNS traffic redirection will alter live production traffic. Human authorization required.
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Directives or notes for the Ops Architect..."
                  value={approvalFeedback}
                  onChange={(e) => setApprovalFeedback(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border font-sans ${
                    isLight ? "bg-white border-pink-300 text-slate-900 focus:border-pink-500" : "bg-slate-950 border-pink-500/50 text-slate-100"
                  }`}
                />
                <button
                  type="button"
                  disabled={isResuming}
                  onClick={() => handleHumanDecision("APPROVE")}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isResuming ? "Authorizing..." : "Authorize Execution"}</span>
                </button>
                <button
                  type="button"
                  disabled={isResuming}
                  onClick={() => handleHumanDecision("REJECT")}
                  className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reject & Revise</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Grid: Mission Dispatcher & Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Mission Dispatcher */}
          <div className="lg:col-span-4 flex flex-col">
            <div className={`p-6 rounded-2xl border transition-all flex-1 flex flex-col justify-between shadow-sm ${
              isLight ? "bg-white border-slate-200/90" : "bg-[#0f172a] border-slate-800"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2 text-pink-600 dark:text-pink-400">
                    <Terminal className="w-4 h-4" />
                    <span>Deploy Mission Objective</span>
                  </h2>

                  <div className="flex items-center space-x-2">
                    {/* Voice Mic Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isListening
                          ? "bg-pink-500 text-white animate-pulse border-pink-600 shadow-md shadow-pink-500/40"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                      }`}
                      title={isListening ? "Listening... Click to stop" : "Click to speak your mission"}
                    >
                      {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseStreaming(!useStreaming)}
                      className={`px-2 py-1 rounded-md border text-xs font-semibold flex items-center space-x-1 transition-all ${
                        useStreaming
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                          : isLight
                          ? "bg-slate-100 border-slate-200 text-slate-600"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      <Zap className="w-3 h-3 text-emerald-500" />
                      <span>{useStreaming ? "SSE" : "Sync"}</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                        Mission Objective Brief
                      </label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Sanitized & Guardrailed</span>
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., Design an automated multi-region failover strategy for PostgreSQL with 10s RTO."
                      className={`w-full rounded-xl p-3 text-sm transition-all focus:outline-none focus:ring-2 border ${
                        isLight
                          ? "bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-pink-500 focus:ring-pink-500/20"
                          : "bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-pink-500 focus:ring-pink-500/20"
                      }`}
                    />
                  </div>

                  {/* HITL Checkbox Gate with Pink/Green Accent */}
                  <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs select-none cursor-pointer transition-colors ${
                    requireApproval
                      ? "bg-pink-50/70 border-pink-300 text-pink-900 dark:bg-pink-950/30 dark:border-pink-600/50 dark:text-pink-200"
                      : isLight
                      ? "bg-slate-50 border-slate-200 text-slate-600"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}>
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold block text-pink-700 dark:text-pink-300">
                        Enforce Human Approval Gate (HITL)
                      </span>
                      <span className="text-[11px] opacity-80">Pauses high-risk operations for explicit sign-off</span>
                    </div>
                  </label>

                  {/* Chaos Engineering Fault Injector Panel */}
                  <div className={`p-3 rounded-2xl border transition-all ${
                    activeChaos
                      ? "bg-rose-950/20 border-rose-500/60 ring-2 ring-rose-500/20"
                      : isLight
                      ? "bg-rose-50/60 border-rose-200"
                      : "bg-slate-900/60 border-rose-950/60"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider flex items-center space-x-1.5 text-rose-600 dark:text-rose-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Chaos Outage Simulator</span>
                      </span>
                      {activeChaos && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-bold animate-pulse border border-rose-500/30">
                          {activeChaos}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CHAOS_SCENARIOS.map((chaos, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTriggerChaos(chaos)}
                          className={`p-2 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                            activeChaos === chaos.title
                              ? "bg-rose-600 text-white font-bold border-rose-500 shadow-md shadow-rose-600/30"
                              : isLight
                              ? "bg-white hover:bg-rose-100/60 border-rose-200 text-slate-800"
                              : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 font-bold truncate">
                            <span>{chaos.icon}</span>
                            <span className="truncate">{chaos.title}</span>
                          </div>
                          <span className="text-[10px] opacity-70 block truncate mt-0.5">{chaos.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset Mission Cards */}
                  <div>
                    <span className={`text-[11px] uppercase font-bold tracking-wider block mb-1.5 ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                      Quick Mission Presets
                    </span>

                    <div className="grid grid-cols-1 gap-1.5">
                      {PRESET_TASKS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPrompt(preset.desc)}
                          className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${
                            isLight
                              ? "bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-700 border-slate-200"
                              : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border-slate-800"
                          }`}
                        >
                          <div className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                            {preset.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {preset.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Config parameters */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        Thread ID
                      </label>
                      <input
                        type="text"
                        value={threadId}
                        onChange={(e) => setThreadId(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono border ${
                          isLight ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-semibold mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        Max Revisions
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={maxIterations}
                        onChange={(e) => setMaxIterations(Number(e.target.value))}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono border ${
                          isLight ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || !prompt.trim() || awaitingApproval}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-600 via-rose-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-pink-600/25 transition-all cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin text-pink-200" />
                          <span>Swarm Operating ({progress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Deploy Protected Ops Swarm</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={isProcessing}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                      title="Reset Session"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: 4-Agent Pipeline Flow */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            <div className={`p-6 rounded-2xl border transition-all flex-1 flex flex-col justify-between shadow-sm ${
              isLight ? "bg-white border-slate-200/90" : "bg-[#0f172a] border-slate-800"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${
                    isLight ? "text-slate-800" : "text-slate-300"
                  }`}>
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Hardened Swarm Pipeline</span>
                  </h2>
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {progress}% COMPLETE
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border font-semibold ${
                      awaitingApproval
                        ? "bg-pink-500/20 border-pink-500 text-pink-600 dark:text-pink-400 animate-pulse"
                        : isProcessing
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 animate-pulse"
                        : isLight
                        ? "bg-slate-100 border-slate-200 text-slate-600"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}>
                      {awaitingApproval ? "AWAITING HUMAN APPROVAL" : isProcessing ? `ACTIVE: ${activeNode?.toUpperCase()}` : "STANDBY"}
                    </span>
                  </div>
                </div>

                {/* Pink to Emerald Gradient Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6">
                  <div
                    className="bg-gradient-to-r from-pink-500 via-rose-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm shadow-pink-500/30"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* 4 Agent Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 my-2">
                  {/* Node 1: Researcher (Emerald) */}
                  <div
                    className={`relative p-4 rounded-xl border transition-all ${
                      activeNode === "researcher"
                        ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-500"
                        : completedNodes.includes("researcher")
                        ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isLight ? "bg-white shadow-sm" : "bg-slate-800/80"}`}>
                        <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {completedNodes.includes("researcher") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : activeNode === "researcher" ? (
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">NODE 1</span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      Lead Researcher
                    </h3>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Discovers topology, bottlenecks, and telemetry metrics.
                    </p>
                  </div>

                  {/* Node 2: DevSecOps Auditor (Pink / Rose) */}
                  <div
                    className={`relative p-4 rounded-xl border transition-all ${
                      activeNode === "security"
                        ? "bg-pink-50 border-pink-500 shadow-md ring-2 ring-pink-500/30 dark:bg-pink-950/40 dark:border-pink-500"
                        : completedNodes.includes("security")
                        ? "bg-pink-50/80 border-pink-300 dark:bg-pink-950/40 dark:border-pink-700"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isLight ? "bg-white shadow-sm" : "bg-slate-800/80"}`}>
                        <Shield className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      {completedNodes.includes("security") ? (
                        <CheckCircle2 className="w-4 h-4 text-pink-500" />
                      ) : activeNode === "security" ? (
                        <Activity className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">NODE 2</span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      DevSecOps Auditor
                    </h3>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Analyzes blast radius, IAM boundaries & secret rotation.
                    </p>
                  </div>

                  {/* Node 3: Quality Evaluator (Emerald) */}
                  <div
                    className={`relative p-4 rounded-xl border transition-all ${
                      activeNode === "evaluator"
                        ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-500"
                        : completedNodes.includes("evaluator")
                        ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isLight ? "bg-white shadow-sm" : "bg-slate-800/80"}`}>
                        <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {completedNodes.includes("evaluator") ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : activeNode === "evaluator" ? (
                        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">NODE 3</span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      Readiness Evaluator
                    </h3>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Scores quality (0-100) & executes loop revision router.
                    </p>
                  </div>

                  {/* Node 4: Ops Architect (Pink / Rose) */}
                  <div
                    className={`relative p-4 rounded-xl border transition-all ${
                      activeNode === "writer"
                        ? "bg-pink-50 border-pink-500 shadow-md ring-2 ring-pink-500/30 dark:bg-pink-950/40 dark:border-pink-500"
                        : completedNodes.includes("writer")
                        ? "bg-pink-50/80 border-pink-300 dark:bg-pink-950/40 dark:border-pink-700"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-500"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isLight ? "bg-white shadow-sm" : "bg-slate-800/80"}`}>
                        <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      {completedNodes.includes("writer") ? (
                        <CheckCircle2 className="w-4 h-4 text-pink-500" />
                      ) : activeNode === "writer" ? (
                        <Activity className="w-4 h-4 text-pink-400 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">NODE 4</span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      Ops Architect
                    </h3>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      Compiles actionable CLI runbook, topology & checklist.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master Telemetry Bar */}
              <div className={`mt-4 p-3.5 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-slate-950/60 border-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Readiness Score</span>
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {crewResult ? `${crewResult.qualityScore}/100` : "--/100"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-pink-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Security Posture</span>
                    <span className="font-mono font-bold text-xs uppercase text-pink-600 dark:text-pink-400">
                      {crewResult ? `${crewResult.securityRiskLevel} RISK` : "SECURED (WAF)"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Execution Latency</span>
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {crewResult?.executionMetrics?.total_duration_ms
                        ? `${crewResult.executionMetrics.total_duration_ms}ms`
                        : `${elapsedSeconds}s`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-pink-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Checkpointer State</span>
                    <span className="font-mono text-xs font-semibold truncate block max-w-[120px] text-slate-700 dark:text-slate-300">
                      {threadId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Output Workspace Tabs */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
          isLight ? "bg-white border-slate-200" : "bg-[#0f172a] border-slate-800 shadow-xl"
        }`}>
          {/* Workspace Tabs Header */}
          <div className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
          }`}>
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("runbook")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "runbook"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Executable Runbook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("topology")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "topology"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Topology & Diff</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("iac");
                  if (!iacCode) handleFetchIaC(iacCloud, iacFormat);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "iac"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>IaC Automation</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("rca");
                  if (!rcaData) handleFetchRca();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "rca"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Post-Mortem (RCA)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "chat"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interrogate Swarm</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>DevSecOps Posture</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("research")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "research"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Research Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("console")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "console"
                    ? "bg-slate-700 text-white shadow"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Console ({logs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === "json"
                    ? "bg-emerald-700 text-white shadow"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>State Snapshot</span>
              </button>
            </div>



            {/* Export Buttons */}
            {crewResult && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopy(crewResult.finalOutput)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-pink-500" />}
                  <span>{copied ? "Copied!" : "Copy Runbook"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("md")}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("json")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  <span>JSON Snapshot</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab 1: Executable Runbook */}
          {activeTab === "runbook" && (
            <div className="p-6 space-y-6">
              {crewResult ? (
                <div className="space-y-6">
                  {/* Dry-Run Sandbox Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2 text-pink-600 dark:text-pink-400">
                        <PlayCircle className="w-4 h-4 text-emerald-500" />
                        <span>Interactive Dry-Run Execution Sandbox</span>
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                        ISOLATED RUNNER ACTIVE
                      </span>
                    </div>

                    {/* Step 1 Sandbox */}
                    <div className={`p-4 rounded-xl border ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          Step 1: Verify Replication Lag
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRunSandbox("step1", "SELECT pid, client_addr FROM pg_stat_replication;")}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Sandbox</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto">
                        SELECT pid, client_addr, pg_wal_lsn_diff(pg_current_wal_lsn(), write_lsn) AS write_lag_bytes FROM pg_stat_replication;
                      </pre>
                      {sandboxOutputs["step1"] && (
                        <div className="mt-3 p-3 bg-slate-950 border border-emerald-500/50 text-emerald-400 rounded-lg text-xs font-mono whitespace-pre-wrap">
                          {sandboxOutputs["step1"].output}
                        </div>
                      )}
                    </div>

                    {/* Step 2 Sandbox */}
                    <div className={`p-4 rounded-xl border ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-pink-600 dark:text-pink-400">
                          Step 2: Annotate Pod Drain & Trigger Promotion
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRunSandbox("step2", "kubectl annotate pod primary-db-0 ops.mission/drain=immediate")}
                          className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-sm shadow-pink-600/20"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Sandbox</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto">
                        kubectl annotate pod primary-db-0 ops.mission/drain=immediate --overwrite && kubectl exec -it standby-db-0 -- pg_ctl promote
                      </pre>
                      {sandboxOutputs["step2"] && (
                        <div className="mt-3 p-3 bg-slate-950 border border-pink-500/50 text-pink-400 rounded-lg text-xs font-mono whitespace-pre-wrap">
                          {sandboxOutputs["step2"].output}
                        </div>
                      )}
                    </div>

                    {/* Step 3 Sandbox */}
                    <div className={`p-4 rounded-xl border ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          Step 3: Switch Route53 DNS Weight
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRunSandbox("step3", "aws route53 change-resource-record-sets")}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/20"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Sandbox</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto">
                        aws route53 change-resource-record-sets --hosted-zone-id Z12345 --change-batch file://failover-dns-update.json
                      </pre>
                      {sandboxOutputs["step3"] && (
                        <div className="mt-3 p-3 bg-slate-950 border border-emerald-500/50 text-emerald-400 rounded-lg text-xs font-mono whitespace-pre-wrap">
                          {sandboxOutputs["step3"].output}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formatted Markdown Output */}
                  <div className={`p-6 rounded-2xl border text-sm whitespace-pre-wrap leading-relaxed font-sans ${
                    isLight ? "bg-slate-50/70 border-slate-200 text-slate-800" : "bg-slate-950/60 border-slate-800 text-slate-300"
                  }`}>
                    {crewResult.finalOutput}
                  </div>

                  {/* Verification Checklist */}
                  <div className={`p-5 rounded-2xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <ListTodo className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Interactive Runbook Checklist (Sandbox Verified)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {[
                        "Verify replication delay under 50ms before initiating failover",
                        "Confirm PgBouncer connection pool drain without HTTP 500 spike",
                        "Execute standby DB promotion via kubectl / AWS CLI",
                        "Update DNS / Route53 weight with zero TTL cache pollution",
                        "Verify synthetic health check HTTP 200 OK on primary regional endpoints",
                        "Commit post-incident snapshot to LangGraph checkpointer memory"
                      ].map((item, idx) => (
                        <label
                          key={idx}
                          onClick={() => toggleChecklistItem(item)}
                          className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                            checklistState[item]
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-600/60 dark:text-emerald-200"
                              : isLight
                              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!checklistState[item]}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={`text-xs ${checklistState[item] ? "line-through opacity-80" : "font-medium"}`}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 opacity-30 text-pink-400" />
                  <p className="text-xs">No active deliverable. Click &quot;Deploy Protected Ops Swarm&quot; to synthesize a verified runbook.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Visual Topology Flow with Pre/Post Diff & Blast Radius */}
          {activeTab === "topology" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className={`text-sm font-bold flex items-center space-x-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <GitCompare className="w-4 h-4 text-emerald-500" />
                    <span>Visual Topology & Pre/Post Architecture Diff</span>
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Compare steady-state normal routing vs emergency failover and inspect blast radius containment.
                  </p>
                </div>

                {/* Pre / Post Diff Toggle */}
                <div className="flex items-center space-x-1 p-1 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTopologyMode("pre");
                      playChime(440, "sine", 0.08);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      topologyMode === "pre"
                        ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Steady State (Pre-Incident)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopologyMode("post");
                      playChime(554.37, "sine", 0.08);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      topologyMode === "post"
                        ? "bg-gradient-to-r from-pink-600 to-emerald-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Failover Cutover (Post-Incident)
                  </button>
                </div>
              </div>

              {/* Blast Radius HUD Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Blast Radius Containment</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">100% Isolated</div>
                  <span className="text-[10px] text-slate-500">Zero cross-VPC leakage</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider text-pink-600 dark:text-pink-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Failover RTO</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">3.8 Seconds</div>
                  <span className="text-[10px] text-slate-500">Atomic DNS cutover</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Transaction Packet Loss</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">0.00% Drops</div>
                  <span className="text-[10px] text-slate-500">PgBouncer pool drained</span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                    <Database className="w-3.5 h-3.5" />
                    <span>WAL Replication Delta</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">&lt; 48 KB Lag</div>
                  <span className="text-[10px] text-slate-500">Synchronous replication</span>
                </div>
              </div>

              {/* Interactive Visual Network Canvas */}
              <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center ${
                isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-950 border-slate-800"
              }`}>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Node 1: Ingress */}
                  <div className={`p-5 rounded-xl border text-center relative ${
                    isLight ? "bg-white border-pink-300 shadow-sm" : "bg-slate-900 border-pink-500/50"
                  }`}>
                    <Server className="w-6 h-6 mx-auto text-pink-500 mb-2" />
                    <div className="text-xs font-bold text-pink-600 dark:text-pink-400">Client Traffic Ingress</div>
                    <div className="text-[11px] text-slate-500 mt-1">Route53 DNS / ALB</div>
                    <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      topologyMode === "pre"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20"
                    }`}>
                      {topologyMode === "pre" ? "100% AZ-1A WEIGHT" : "100% STANDBY WEIGHT (AZ-1B)"}
                    </span>
                  </div>

                  {/* Flow Arrow & PgBouncer Pool */}
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-[11px] font-mono font-bold text-slate-400">mTLS Proxy Pool</div>
                    <div className="w-full border-t-2 border-dashed border-emerald-500 relative">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pink-500 animate-ping" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">
                      {topologyMode === "pre" ? "POOL HEALTHY (ACTIVE)" : "DRAIN VERIFIED (0 IN-FLIGHT)"}
                    </span>
                  </div>

                  {/* Node 3: Target Database */}
                  {topologyMode === "pre" ? (
                    <div className={`p-5 rounded-xl border text-center relative ${
                      isLight ? "bg-white border-blue-400 shadow-md" : "bg-slate-900 border-blue-500 shadow-lg"
                    }`}>
                      <Database className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Primary DB (Active Write)</div>
                      <div className="text-[11px] text-slate-500 mt-1">AZ us-east-1a (Active WAL Sync)</div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                        STATUS: ONLINE (PRIMARY)
                      </span>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-xl border text-center relative ${
                      isLight ? "bg-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20" : "bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10"
                    }`}>
                      <Database className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Promoted Primary DB</div>
                      <div className="text-[11px] text-slate-500 mt-1">AZ us-east-1b (Active Write)</div>
                      <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                        STATUS: PROMOTED (RTO 3.8s)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 w-full max-w-4xl flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Zero-Trust Encryption: TLS 1.3 Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Workflow className="w-4 h-4 text-pink-500" />
                    <span>Checkpointer: State Memory Saved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Synthetic Health Probes: HTTP 200 OK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: IaC & Automation Exporter (Terraform, Ansible, Bash) */}
          {activeTab === "iac" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={`text-sm font-bold flex items-center space-x-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <Code2 className="w-4 h-4 text-pink-500" />
                    <span>Multi-Cloud Infrastructure-as-Code (IaC) Exporter</span>
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Generate production Terraform modules, Ansible playbooks, and hardened cutover shell scripts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Cloud Selector */}
                  <div className="flex items-center space-x-1 p-1 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs">
                    {(["AWS", "GCP", "Azure"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleFetchIaC(c, iacFormat)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          iacCloud === c
                            ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Format Selector */}
                  <div className="flex items-center space-x-1 p-1 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs">
                    {[
                      { key: "terraform", label: "Terraform (.tf)" },
                      { key: "ansible", label: "Ansible (.yml)" },
                      { key: "bash", label: "Shell (.sh)" }
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => handleFetchIaC(iacCloud, f.key as any)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          iacFormat === f.key
                            ? "bg-pink-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-bold text-slate-300">
                      failover.{iacFormat === "terraform" ? "tf" : iacFormat === "ansible" ? "yml" : "sh"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-pink-400 font-bold">
                      {iacCloud} Target
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(iacCode)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[11px]"
                    >
                      <Copy className="w-3 h-3 text-pink-400" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCustomFile(
                        `failover.${iacFormat === "terraform" ? "tf" : iacFormat === "ansible" ? "yml" : "sh"}`,
                        iacCode
                      )}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer font-bold text-[11px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <pre className="p-5 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
                  {isGeneratingIaC ? "// Generating multi-cloud IaC module..." : iacCode || "// Click any cloud or format above to generate automated IaC."}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 4: SRE Post-Mortem & RCA Generator */}
          {activeTab === "rca" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={`text-sm font-bold flex items-center space-x-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    <span>Automated SRE Incident Post-Mortem & Root Cause Analysis</span>
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Formal Root Cause Analysis document with MTTR, financial business impact calculation, and 5-Whys.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleFetchRca}
                    disabled={isGeneratingRca}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingRca ? "animate-spin" : ""}`} />
                    <span>Recompute RCA</span>
                  </button>
                  {rcaData && (
                    <button
                      type="button"
                      onClick={() => downloadCustomFile("post-mortem-RCA.md", rcaData.rca_markdown)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  )}
                </div>
              </div>

              {/* RCA Metrics HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${
                  isLight ? "bg-rose-50/60 border-rose-200" : "bg-rose-950/20 border-rose-900/50"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mean Time to Resolution (MTTR)</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {rcaData?.mttr || `${rcaDuration} minutes`}
                  </div>
                  <span className="text-[10px] text-slate-500">Autonomous detection to cutover</span>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isLight ? "bg-amber-50/60 border-amber-200" : "bg-amber-950/20 border-amber-900/50"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Estimated Downtime Cost</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {rcaData?.estimated_cost || `$${rcaDuration * 2400}`}
                  </div>
                  <span className="text-[10px] text-slate-500">Based on Tier-1 SLA downtime impact</span>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isLight ? "bg-emerald-50/60 border-emerald-200" : "bg-emerald-950/20 border-emerald-900/50"
                }`}>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Incident Severity & Status</span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    SEV-1 Resolved
                  </div>
                  <span className="text-[10px] text-slate-500">Zero data loss guaranteed</span>
                </div>
              </div>

              {/* RCA Markdown Body */}
              <div className={`p-6 rounded-2xl border text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-[500px] overflow-y-auto ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-300"
              }`}>
                {rcaData?.rca_markdown || "// Click 'Recompute RCA' to generate formal Post-Mortem documentation."}
              </div>
            </div>
          )}

          {/* Tab 5: Interrogate the Swarm (Agent Chat) */}
          {activeTab === "chat" && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={`text-sm font-bold flex items-center space-x-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <MessageSquare className="w-4 h-4 text-purple-500" />
                    <span>Interrogate the Swarm (Context-Aware Agent Q&A)</span>
                  </h3>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Directly interview individual swarm agents about threat vectors, latency benchmarks, or readiness scoring.
                  </p>
                </div>

                {/* Target Agent Selector */}
                <div className="flex items-center space-x-1 p-1 rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs">
                  {[
                    { name: "Security", color: "text-pink-500" },
                    { name: "Researcher", color: "text-emerald-500" },
                    { name: "Evaluator", color: "text-amber-500" },
                    { name: "Writer", color: "text-purple-500" }
                  ].map((ag) => (
                    <button
                      key={ag.name}
                      type="button"
                      onClick={() => setInterrogateAgent(ag.name as any)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        interrogateAgent === ag.name
                          ? "bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className={ag.color}>@{ag.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message History */}
              <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl h-80 overflow-y-auto space-y-3 border border-slate-800 font-mono text-xs">
                {interrogateHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border ${
                      msg.sender.includes("You")
                        ? "bg-slate-900/80 border-slate-800 ml-12 text-slate-200"
                        : msg.sender === "Security"
                        ? "bg-pink-950/30 border-pink-800/60 mr-12 text-pink-200"
                        : msg.sender === "Researcher"
                        ? "bg-emerald-950/30 border-emerald-800/60 mr-12 text-emerald-200"
                        : msg.sender === "Evaluator"
                        ? "bg-amber-950/30 border-amber-800/60 mr-12 text-amber-200"
                        : "bg-purple-950/30 border-purple-800/60 mr-12 text-purple-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-white">
                        {msg.sender}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-xs">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Questions & Input Bar */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase py-1">Quick Inquiries:</span>
                  {[
                    "Why was this classified as HIGH risk?",
                    "What are the rollback conditions if promotion fails?",
                    "What cluster telemetry threshold triggers failover?",
                    "Explain the RTO calculation methodology."
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInterrogateInput(q)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                          : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendInterrogate} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={interrogateInput}
                    onChange={(e) => setInterrogateInput(e.target.value)}
                    placeholder={`Ask @${interrogateAgent} about this mission...`}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/20 ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-pink-500"
                        : "bg-slate-950 border-slate-800 text-slate-100 focus:border-pink-500"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isInterrogating || !interrogateInput.trim()}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-pink-600/20 transition-all cursor-pointer"
                  >
                    {isInterrogating ? (
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}


          {/* Tab 3: DevSecOps Posture */}
          {activeTab === "security" && (
            <div className="p-6 space-y-6">
              {crewResult?.securityAudit ? (
                <>
                  <div className={`p-5 rounded-2xl border ${
                    crewResult.securityRiskLevel === "HIGH"
                      ? "bg-pink-50 border-pink-300 text-pink-900 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-200"
                      : "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <ShieldAlert className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300">
                          DevSecOps Posture: {crewResult.securityRiskLevel} RISK
                        </h3>
                        <p className="text-xs mt-0.5 opacity-90">
                          OWASP LLM01 compliance verified. Input sanitization, permission boundary enforcement, and secret rotation audited.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border text-xs whitespace-pre-wrap font-mono leading-relaxed ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}>
                    {crewResult.securityAudit}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 text-pink-600 dark:text-pink-400">
                      Mandatory Security Safeguards
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {crewResult.securityFindings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border text-xs leading-relaxed bg-pink-50/70 border-pink-200 text-pink-900 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300"
                        >
                          <span className="font-bold block mb-1">SAFEGUARD #{idx + 1}</span>
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Shield className="w-8 h-8 opacity-30 text-pink-400" />
                  <p className="text-xs">Security audit standby. Deploy the crew to execute a DevSecOps threat assessment.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Research Dossier */}
          {activeTab === "research" && (
            <div className="p-6 space-y-6">
              {crewResult?.researchNotes ? (
                <>
                  <div className={`p-6 rounded-2xl border text-xs whitespace-pre-wrap font-mono leading-relaxed ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}>
                    {crewResult.researchNotes}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 text-emerald-600 dark:text-emerald-400">
                      Referenced Operational Datastores
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {crewResult.sources.map((src, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1.5 rounded-lg border font-mono font-semibold bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Search className="w-8 h-8 opacity-30 text-emerald-400" />
                  <p className="text-xs">Research dossier standby.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Live Console */}
          {activeTab === "console" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Filter logs (e.g. Researcher, Security, Operator)..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs w-72 ${
                    isLight ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(logs.map((l) => `[${l.timestamp}] [${l.node}] ${l.message}`).join("\n"))}
                  className={`text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLight
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                >
                  <Copy className="w-3 h-3 text-pink-500" />
                  <span>Copy Logs</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-2xl h-80 overflow-y-auto space-y-2 border border-slate-800">
                {filteredLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 opacity-30 text-emerald-400" />
                    <p>No log events matching filter.</p>
                  </div>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-3 py-1 border-b border-slate-900/70">
                      <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                      <span
                        className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                          log.node === "Researcher"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : log.node === "Security"
                            ? "bg-pink-950 text-pink-400 border border-pink-800"
                            : log.node === "Evaluator"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : log.node === "ApprovalGate" || log.node === "Operator"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : log.node === "Writer"
                            ? "bg-purple-950 text-purple-400 border border-purple-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.node}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-200">{log.message}</p>
                        {log.detail && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{log.detail}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* Tab 6: State Snapshot */}
          {activeTab === "json" && (
            <div className="p-6">
              <pre className="p-5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
                {crewResult ? JSON.stringify(crewResult, null, 2) : "// State checkpoint empty. Deploy swarm to capture memory snapshot."}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
