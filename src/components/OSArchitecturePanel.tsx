import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Terminal, 
  Brain, 
  Eye, 
  Database, 
  Users, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  MousePointer, 
  Camera, 
  Search, 
  Download 
} from 'lucide-react';

export default function OSArchitecturePanel() {
  const [activeLayer, setActiveLayer] = useState<number | null>(1);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'layers' | 'agents' | 'flow'>('layers');

  // Interactive 7 Layers Data
  const layers = [
    {
      id: 1,
      name: "Layer 1: Orchestrator (The Brain)",
      subtitle: "Workflow & Queue Scheduling",
      description: "Handles asynchronous cron cycles, failover operations, queue serialization, and distributed job worker dispatch.",
      tech: "Temporal.io / n8n / BullMQ",
      points: [
        "Distributed job workers with active lock handshakes.",
        "Deterministic workflow state engines with infinite retries.",
        "Trigger pipelines on commit hooks, daily crons, or manual webhooks."
      ],
      icon: Cpu,
      accent: "text-brand-accent border-brand-accent/30 bg-brand-accent/5",
      badgeColor: "bg-brand-accent/20 text-brand-accent border-brand-accent/30"
    },
    {
      id: 2,
      name: "Layer 2: Browser Automation Engine",
      subtitle: "Deterministic Execution Layer",
      description: "Direct control of the browser sandbox to authenticately replicate user interactions and cookie tokens with zero-flicker stability.",
      tech: "Playwright (recommended) / Puppeteer",
      points: [
        "Saves active token session states and synchronizes cookie maps.",
        "Crawls client-side SPA route trees and dynamically triggers popups/modals.",
        "Configurable wait stabilization timers (default 450ms) to bypass skeleton load variations."
      ],
      icon: Terminal,
      accent: "text-brand-warning border-brand-warning/30 bg-brand-warning/5",
      badgeColor: "bg-brand-warning/20 text-brand-warning border-brand-warning/30"
    },
    {
      id: 3,
      name: "Layer 3: AI Reasoning Layer",
      subtitle: "Semantic Intelligence Engine",
      description: "Processes screenshots, DOM configurations, and network logs to isolate root causes and classify issues.",
      tech: "Gemini 2.5 Flash / Claude 3.5 Sonnet",
      points: [
        "Filters false-positives by analyzing structural context and purpose.",
        "Automatically writes comprehensive error summaries and developer remediation tips.",
        "Translates raw layout variances into sensible, classified design systems issues."
      ],
      icon: Brain,
      accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    },
    {
      id: 4,
      name: "Layer 4: Visual Regression Engine",
      subtitle: "Computer Vision Diff Engine",
      description: "Performs deep layout inspections, pixel comparisons, and typographical metrics evaluation to detect microscopic anomalies.",
      tech: "Applitools / OpenCV Pixel-Diff / ResembleOS",
      points: [
        "High-performance structural canvas comparisons (pixel variance analysis).",
        "Applies strict masking coordinates for dynamic layout tokens (timestamps, statistics).",
        "Handles layout responsive shift constraints and font system fallback swaps."
      ],
      icon: Eye,
      accent: "text-pink-400 border-pink-500/30 bg-pink-500/5",
      badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30"
    },
    {
      id: 5,
      name: "Layer 5: Storage System",
      subtitle: "Asset & Event Store",
      description: "Persists structural DOM manifests, visual screenshots, mismatch highlight overlays, and audit trail JSON objects.",
      tech: "PostgreSQL / S3 Object Buckets",
      points: [
        "Time-series database tracking historic audit trails and sign-offs.",
        "Encrypted multi-tenant bucket hosting prototype and stage binary screen capture maps.",
        "Records interaction coordinate replay matrices for debugging."
      ],
      icon: Database,
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    },
    {
      id: 6,
      name: "Layer 6: Human-in-the-Loop Review",
      subtitle: "Adaptive Approval Pipeline",
      description: "Guarantees full human guardrails, allowing engineers to promote variances, sign off on discrepancies, or request developer fixes.",
      tech: "Enterprise Auth Systems / Double Auditing Promoters",
      points: [
        "Co-auditor signature authentication protocol for baseline promotional standard overrides.",
        "Direct input logs for temporary layout overrides and regression overrides.",
        "Granular review status states: Approved, Dismissed (False Positive), Promoted to Baseline."
      ],
      icon: Users,
      accent: "text-teal-400 border-teal-500/30 bg-teal-500/5",
      badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30"
    },
    {
      id: 7,
      name: "Layer 7: Report Engine",
      subtitle: "Inter-Team Export Hub",
      description: "Generates comprehensive test telemetry, interactive HTML review cards, and offline project bundles for external review.",
      tech: "Native Zip Archive Generators / Webhook Integrations",
      points: [
        "Compiles structured zip payloads with screenshots, logs, and visual delta diffs.",
        "Sends real-time Slack/Teams verification notifications with direct deep-linking.",
        "Outputs semantic API JSON payloads for direct enterprise CI/CD gates hookups."
      ],
      icon: FileText,
      accent: "text-red-400 border-red-500/30 bg-red-500/5",
      badgeColor: "bg-red-500/20 text-red-400 border-red-100/30"
    }
  ];

  // Core Specialized QA Agents List
  const agents = [
    {
      name: "Crawl Agent",
      role: "Route Map & Site Tree Exploration",
      icon: Search,
      desc: "Autonomously interacts with navigation systems, drawer triggers, and tabs to map fully-qualified target crawl trees.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Configured with anti-infinite-loop limits. Discovers deep SPA paths dynamically."
    },
    {
      name: "Interaction Agent",
      role: "Interactive Event Triggering",
      icon: MousePointer,
      desc: "Autonomously clicks action items, inputs mock field data, handles modals, and records detailed coordinate reply paths.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Saves raw dynamic coordinates into playback matrix for accurate re-simulation."
    },
    {
      name: "Screenshot Agent",
      role: "Viewport Pixel Capture",
      icon: Camera,
      desc: "Snaps responsive viewport captures across multiple sizing configurations, coordinating waits to guarantee complete stabilization.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Handles dual pixel ratio scaling and ignores user-agent telemetry artifacts."
    },
    {
      name: "Visual Diff Agent",
      role: "Structural Pixel Variance Analyzer",
      icon: Eye,
      desc: "Runs multi-threaded pixel comparators, processes threshold tolerances (e.g. 5%), and applies masking rules to live volatile DOM elements.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Suppresses transient time-series shifts and volatile data variables instantly."
    },
    {
      name: "AI Analysis Agent",
      role: "Layout and Remediation Reasoning",
      icon: Brain,
      desc: "Feeds screenshot mismatches to deep LLM visual layers to evaluate severity, identify potential bugs, and outline root cause remediations.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Uses a highly specific context model to reduce developer report fatigue."
    },
    {
      name: "Functional QA Agent",
      role: "SLA and Component Verification",
      icon: ShieldCheck,
      desc: "Asserts network redirect states, Spanner database transaction speeds, status codes, and component render timings.",
      status: "ACTIVE",
      statusColor: "text-brand-success bg-brand-success/15 border-brand-success/40",
      notes: "Identified the unindexed Spanner query latency regression on 'database-sync-3'."
    },
    {
      name: "Report Agent",
      role: "CI/CD Gates and Telemetry Compilation",
      icon: FileText,
      desc: "Zips and bundles visual reports, exports structured JSON audit logs, and relays webhook notifications to development workflows.",
      status: "STANDBY",
      statusColor: "text-brand-warning bg-brand-warning/15 border-brand-warning/40",
      notes: "Dispatches updates directly to Slack slack://connect-oauth-hub."
    },
    {
      name: "Human Review Agent",
      role: "Prompts & Double Auditing Sign-off",
      icon: Users,
      desc: "Orchestrates human interventions to sign-off, dismiss false alerts, or request dual signature standard authorizations to advance baselines.",
      status: "WAIT_GATE",
      statusColor: "text-indigo-400 bg-indigo-500/15 border-indigo-500/40",
      notes: "Enforces strict peer email checks under 'requires_double_reviewer' baseline policies."
    }
  ];

  // System Flows Data
  const flows = [
    {
      step: 1,
      title: "1. Configuration & Scope Binding",
      actor: "User Customizations",
      action: "Inputs Candidate URLs, organizational tenant keys, targeted modules list, and exclusion masking selectors.",
      result: "Jobs are queued on Layer 1 Orchestrator with configuration criteria mapped to state variables."
    },
    {
      step: 2,
      title: "2. Preserving Context & Safe Authentication",
      actor: "Browser Automation Layer (Playwright-First)",
      action: "Launches multi-threaded browser engines, authenticates the session, and saves cookie caches to skip subsequent logins.",
      result: "Unified cookies synced successfully into safe autonomous environments. Setup verified."
    },
    {
      step: 3,
      title: "3. Crawler & Interactive Replay Routing",
      actor: "Crawl & Interaction Agents",
      action: "Iterates through candidate routes, clicks trigger grids, registers dynamic coordinates, and inputs dummy values.",
      result: "All volatile DOM selectors and active paths captured. Fully interactive maps compiled."
    },
    {
      step: 4,
      title: "4. Stabilization & High-Fidelity Capture",
      actor: "Screenshot Agent",
      action: "Applies stabilization timers (e.g. 450ms) to ensure all static resources are fully-loaded before capturing frame PNGs.",
      result: "Pristine, non-hallucinated viewport maps collected for both environments (Prototype vs Stage)."
    },
    {
      step: 5,
      title: "5. Structural Pixel-Diff Extraction",
      actor: "Visual Diff Engine (OpenCV/Applitools)",
      action: "Executes side-by-side computer vision diff checks, filtering out live ignored selectors and testing pixel thresholds.",
      result: "Highlight masks overlaid precisely on mismatch coordinates. Generates comparison files."
    },
    {
      step: 6,
      title: "6. AI Reasoning & Remediation Analysis",
      actor: "AI Analysis Agent (Gemini/Claude)",
      action: "Inspects visual mismatches and DOM difference markers to classify severity levels (Critical to Minor) and isolate potential root-causes.",
      result: "Structured markdown summaries and precise root-cause analysis recorded on data models."
    },
    {
      step: 7,
      title: "7. Human Sign-off & Promotion Registry",
      actor: "Human Review Node & Report Dispatch",
      action: "Invokes single/double signature checks, records audit compliance logs, modifies permanent baselines, and compiles ZIP outputs.",
      result: "QA baseline database safely updated. CI/CD platform state finalized. Telegram/Slack webhooks posted."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="architecture-blueprint-panel">
      {/* Editorial Header Banner */}
      <div className="bg-brand-surface border border-brand-border p-8 rounded-lg relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-mono font-bold px-2.5 py-1 rounded">
              ENTERPRISE PLATFORM FRAMEWORK
            </span>
            <span className="text-[10px] bg-emerald-950/40 border border-brand-success/20 text-brand-success font-mono font-semibold px-2.5 py-1 rounded">
              DETERMINISM VERIFIED
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
            AI-Native Autonomous QA Operating System
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            A radical departure from fragile, high-maintenance end-to-end scripts. By prioritizing a 
            {" "}<strong className="text-white">Playwright-First Deterministic Execution</strong> layer coupled with 
            an <strong className="text-white">AI-First Cognitive Reasoning Layer</strong>, SnoopQA provides a complete, 
            resilient browser visual-regression harness.
          </p>
        </div>

        <div className="bg-black/40 border border-brand-border p-4 rounded text-xs max-w-xs shrink-0 font-mono space-y-2 relative z-10">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">ARCHITECTURE FORMULA</div>
          <div className="text-slate-300">
            <span className="text-brand-accent font-bold">Playwright Engine</span>
            <span className="text-slate-500 px-1">=</span>
            <span className="text-white">Deterministic Execution</span>
          </div>
          <div className="text-slate-300">
            <span className="text-indigo-400 font-bold">Generative AI</span>
            <span className="text-slate-500 px-1">=</span>
            <span className="text-white">Cognitive Reasoning</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 leading-relaxed border-t border-brand-border/40 pt-2">
            "We do not trust AI to crawl. We trust Playwright to execute and AI to interpret."
          </p>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="flex border-b border-brand-border/60">
        <button
          onClick={() => setActiveTab('layers')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'layers' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Layers className="w-4 h-4" /> 7-Layer Structural Stack
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'agents' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Cpu className="w-4 h-4" /> Specialized QA Agents Fleet
        </button>
        <button
          onClick={() => setActiveTab('flow')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'flow' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Sparkles className="w-4 h-4" /> Live System Execution Flow
        </button>
      </div>

      {/* 1. Layers Panel */}
      {activeTab === 'layers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Interactive Stack list */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-3">SELECT ARCHITECTURAL LAYER</div>
            {layers.map((layer) => {
              const IconComp = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`w-full text-left p-4 rounded border transition flex items-center gap-4 ${isSelected ? 'bg-brand-surface border-brand-accent/50 text-white shadow-lg shadow-brand-accent/5' : 'bg-brand-surface/20 border-brand-border text-slate-400 hover:bg-brand-surface/60 hover:text-slate-300'}`}
                >
                  <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-brand-accent/15 border-brand-accent/30 text-brand-accent' : 'bg-black/40 border-slate-800 text-slate-400'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="grow min-w-0">
                    <div className="font-bold text-xs font-mono">{layer.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{layer.subtitle}</div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition ${isSelected ? 'text-brand-accent translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Layer card info */}
          <div className="lg:col-span-7">
            {activeLayer !== null && (() => {
              const selected = layers.find(l => l.id === activeLayer)!;
              const IconComp = selected.icon;
              return (
                <div className="bg-brand-surface border border-brand-border/80 rounded-lg p-6 lg:p-8 space-y-6 animate-fade-in relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-brand-accent/5 rounded-full blur-2xl -mr-10 -mt-20 pointer-events-none"></div>
                  
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5ClassName">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${selected.badgeColor}`}>
                            ACTIVE CONTEXT SPECIFICATION
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight mt-1">{selected.name}</h3>
                        <p className="text-xs text-brand-accent font-mono font-semibold">{selected.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 ${selected.accent}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans border-t border-brand-border/40 pt-4">
                      {selected.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CORE RESPONSIBILITIES AND OBJECTIVES</h4>
                      <ul className="space-y-2.5">
                        {selected.points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0 animate-pulse"></span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-brand-border p-3.5 rounded mt-6 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">RECOMMENDED MVP TECH:</span>
                    <span className="text-brand-warning font-bold">{selected.tech}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. Specialized Fleet Grid */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Specialized Autonomous QA Agents Fleet
              </h3>
              <p className="text-[11px] text-slate-400">
                SnoopQA deploys modular, single-responsibilty sub-agents rather than relying on one unstable monolithic LLM agent.
              </p>
            </div>
            <span className="text-[9px] bg-brand-accent/15 border border-brand-accent/40 text-brand-accent font-mono font-bold px-2 py-1 rounded">
              TOTAL COMPLEMENT: 8 ACTIVE SUB-SYSTEMS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((ag, idx) => {
              const IconComp = ag.icon;
              return (
                <div key={idx} className="bg-brand-surface border border-brand-border/70 p-5 rounded-lg flex flex-col justify-between space-y-4 hover:border-brand-accent/30 transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded bg-black/40 border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold border ${ag.statusColor}`}>
                        ● {ag.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white font-sans">{ag.name}</h4>
                      <div className="text-[10px] text-brand-accent/80 font-mono mt-0.5">{ag.role}</div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {ag.desc}
                    </p>
                  </div>

                  <div className="bg-black/20 p-2 border border-brand-border/40 rounded text-[9px] font-mono text-slate-500">
                    <span className="text-slate-400 font-bold block mb-0.5">Telemetry Notes:</span>
                    {ag.notes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. System Flow Simulator */}
      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline steps locator */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-3">SYSTEM SEQUENCE STEPPER</div>
            {flows.map((fl) => (
              <button
                key={fl.step}
                onClick={() => setSimulationStep(fl.step - 1)}
                className={`w-full text-left px-4 py-3 border rounded text-xs transition flex gap-3 items-center ${simulationStep === fl.step - 1 ? 'bg-brand-surface border-brand-accent/50 text-white font-bold' : 'bg-brand-surface/20 border-brand-border text-slate-400 hover:bg-brand-surface/40'}`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${simulationStep === fl.step - 1 ? 'bg-brand-accent text-white' : 'bg-black/60 text-slate-500'}`}>
                  {fl.step}
                </span>
                <span className="truncate">{fl.title}</span>
              </button>
            ))}

            <div className="pt-4 gap-2 flex">
              <button
                onClick={() => setSimulationStep(0)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded font-mono border border-brand-border"
              >
                RESET
              </button>
              <button
                onClick={() => setSimulationStep(prev => (prev + 1) % flows.length)}
                className="w-full py-2 bg-brand-accent hover:bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider rounded font-mono shadow"
              >
                NEXT STEP
              </button>
            </div>
          </div>

          {/* Core Simulator Console representation */}
          <div className="lg:col-span-8 bg-black/40 border border-brand-border/80 rounded-lg p-6 font-mono space-y-5 relative">
            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
              SESSION ID: SN-FLOW-SIM
            </div>

            <div className="text-[10px] text-slate-500 font-bold border-b border-brand-border/40 pb-2 mb-3 tracking-widest uppercase">
              CONSOLE REPLICATION TERMINAL
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-accent font-bold">[STEP {simulationStep + 1} OF {flows.length}] ACTOR DISPATCHED</span>
                <h4 className="text-xs font-bold text-white font-sans">{flows[simulationStep].title}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-brand-surface border border-brand-border/60 p-3.5 rounded">
                  <span className="text-brand-warning text-[9px] font-bold uppercase tracking-wider block mb-1">EXECUTION ROUTINE</span>
                  <span className="text-slate-400 text-[10px] block leading-relaxed">{flows[simulationStep].action}</span>
                </div>
                <div className="bg-brand-surface border border-brand-border/60 p-3.5 rounded">
                  <span className="text-brand-success text-[9px] font-bold uppercase tracking-wider block mb-1">MUTABLE OUTCOME</span>
                  <span className="text-slate-400 text-[10px] block leading-relaxed">{flows[simulationStep].result}</span>
                </div>
              </div>

              <div className="border border-brand-border/40 p-3 rounded bg-black/60 text-[11px] leading-relaxed relative overflow-hidden">
                <div className="text-[8px] text-slate-500 font-bold tracking-wider mb-1 uppercase">ORCHESTRATOR COMPLIANCE CHECK</div>
                <div className="text-brand-accent font-bold">● STATE COMPLIANT &raquo; STABLE SEEDS ACTIVE</div>
                <div className="text-slate-500 text-[10px] mt-1.5 leading-relaxed">
                  Asserting and persisting parameters into localized storage buckets... Complete database transactions registered perfectly.
                </div>
              </div>
            </div>

            {/* Simulated flow visual bar */}
            <div className="pt-2 border-t border-brand-border/40 space-y-2">
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>SIMULATION COMPLETION BAR</span>
                <span>{Math.round(((simulationStep + 1) / flows.length) * 100)}%</span>
              </div>
              <div className="w-full bg-brand-border h-1.5 rounded overflow-hidden">
                <div 
                  className="bg-brand-accent h-full rounded transition-all duration-300" 
                  style={{ width: `${((simulationStep + 1) / flows.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Core Architecture takeaways box */}
      <div className="bg-brand-surface/40 border border-brand-border rounded p-6">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-brand-warning" /> MOST IMPORTANT ENGINEERING DECISION
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Always decouple <strong className="text-white">autonomous crawling</strong> from AI capabilities. 
          Standard generative models lack layout-level determinism; relying on AI to crawl, click, and wait leads to deadlocks 
          and infinite loops. Instead, utilize <strong className="text-brand-accent">Playwright-first deterministic code execution</strong> to 
          reproducibly capture state and visual artifacts, then utilize the <strong className="text-indigo-400">AI-first cognitive reasoning</strong> layers 
          to judge variations, isolate root causes, and write intelligent remediation bug tickets.
        </p>
      </div>
    </div>
  );
}
