import React, { useState, useEffect, useRef } from 'react';
import { TestRun, Issue, Project, Severity } from '../types';
import { Eye, CheckCircle2, AlertTriangle, HelpCircle, Bug, Sparkles, ChevronLeft, ArrowRight, RefreshCw, Layers, Sliders, Layout, Type, Loader, Play, ChevronDown, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SnoopCompareWorkspaceProps {
  project: Project;
  testRuns: TestRun[];
  onReviewIssue: (issueId: string, status: 'approved' | 'dismissed_false_positive' | 'promoted_baseline', notes: string) => void;
  activeIssueId?: string;
}

export default function SnoopCompareWorkspace({ project, testRuns, onReviewIssue, activeIssueId }: SnoopCompareWorkspaceProps) {
  // Find completed runs or fall back to simulated initial issues
  const completedRun = testRuns.find(r => r.status === 'completed') || testRuns[0];
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side' | 'contour'>('slider');
  const [slidePos, setSlidePos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Custom states for the user interaction feedback
  const [testerNotes, setTesterNotes] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [playgroundLogs, setPlaygroundLogs] = useState<string[]>([]);
  
  // Enterprise Dual Approver states for human-in-the-loop baseline promotion flow
  const [peerApprover, setPeerApprover] = useState('');
  const [showPeerPrompt, setShowPeerPrompt] = useState(false);

  // Severity and Status multi-select filter controls
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['Critical', 'Major', 'Minor', 'Clarity Needed']);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'approved', 'dismissed']);
  const [isSeverityOpen, setIsSeverityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const severityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (severityRef.current && !severityRef.current.contains(event.target as Node)) {
        setIsSeverityOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to match issue status with selections
  const matchesStatus = (issueStatus: string, selected: string[]) => {
    if (issueStatus === 'pending' && selected.includes('pending')) return true;
    if (issueStatus === 'approved' && selected.includes('approved')) return true;
    if ((issueStatus === 'dismissed_false_positive' || issueStatus === 'promoted_baseline') && selected.includes('dismissed')) return true;
    return false;
  };

  // Filter issues based on selections
  const filteredIssues = completedRun ? completedRun.issues.filter(iss => {
    const severityMatch = selectedSeverities.includes(iss.severity);
    const statusMatch = matchesStatus(iss.status, selectedStatuses);
    return severityMatch && statusMatch;
  }) : [];

  // Automatically select the active or first issue on initialization & filter update
  useEffect(() => {
    if (filteredIssues.length > 0) {
      const isStillInList = activeIssue && filteredIssues.some(i => i.id === activeIssue.id);
      if (!isStillInList) {
        const first = filteredIssues[0];
        setActiveIssue(first);
        setTesterNotes(first.notes || '');
        setAiAnalysisResult('');
      }
    } else {
      setActiveIssue(null);
    }
  }, [selectedSeverities, selectedStatuses, completedRun]);

  // Handle HOP back to specific discrepancy
  useEffect(() => {
    if (completedRun && activeIssueId) {
      const matching = completedRun.issues.find(i => i.id === activeIssueId);
      if (matching) {
        // Reset filters if matching issue is currently filtered out to ensure visibility
        const isFiltered = !selectedSeverities.includes(matching.severity) || !matchesStatus(matching.status, selectedStatuses);
        if (isFiltered) {
          setSelectedSeverities(['Critical', 'Major', 'Minor', 'Clarity Needed']);
          setSelectedStatuses(['pending', 'approved', 'dismissed']);
        }
        setActiveIssue(matching);
        setTesterNotes(matching.notes || '');
        setAiAnalysisResult('');
      }
    }
  }, [activeIssueId, completedRun]);

  const selectIssue = (issue: Issue) => {
    setActiveIssue(issue);
    setTesterNotes(issue.notes || '');
    setAiAnalysisResult('');
    setPlaygroundLogs([]);
  };

  // Drag interaction for the split slider comparison
  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSlidePos(Math.max(0, Math.min(100, pos)));
  };

  // Perform Server-Side Gemini analysis on target discrepancy
  const triggerGeminiAnalysis = async () => {
    if (!activeIssue) return;
    setIsAiLoading(true);
    setAiAnalysisResult('');
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenName: activeIssue.screenName,
          moduleName: activeIssue.moduleName,
          path: `/${activeIssue.moduleId}/view`,
          category: activeIssue.category,
          selector: activeIssue.elementSelector,
          prototypeValue: activeIssue.prototypeValue,
          stageValue: activeIssue.stageValue,
          severity: activeIssue.severity
        })
      });
      const data = await res.json();
      setAiAnalysisResult(data.text || 'Unable to load analysis.');
    } catch (err: any) {
      setAiAnalysisResult(`Failed calling design consultant intelligence: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReviewAction = (action: 'approved' | 'dismissed_false_positive' | 'promoted_baseline', peerSign?: string) => {
    if (!activeIssue) return;

    // Enforce Human-In-Loop double auditing checks if configured
    if (action === 'promoted_baseline' && project.baselineApprovalMode === 'requires_double_reviewer' && !peerSign) {
      setShowPeerPrompt(true);
      return;
    }

    onReviewIssue(activeIssue.id, action, testerNotes);
    
    // Auto record audit action on backend
    const signDetails = peerSign 
      ? `QA Engineer signed off with Co-Auditor [${peerSign}]. Elevated discrepancy to project standard baseline.`
      : `QA Engineer reviewed ${activeIssue.screenName} (${activeIssue.category} issue): marked as ${action.toUpperCase()}`;

    fetch('/api/audit/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        action,
        details: signDetails
      })
    }).catch(console.error);

    // Reset prompt state
    setShowPeerPrompt(false);
    setPeerApprover('');

    // Auto advance to next pending issue
    if (completedRun) {
      const currentIndex = completedRun.issues.findIndex(i => i.id === activeIssue.id);
      const nextPending = completedRun.issues
        .slice(currentIndex + 1)
        .concat(completedRun.issues.slice(0, currentIndex))
        .find(i => i.id !== activeIssue.id && i.status === 'pending');
      if (nextPending) {
        selectIssue(nextPending);
      }
    }
  };

  const simulatePlaygroundClick = () => {
    if (!activeIssue) return;
    const stamp = new Date().toLocaleTimeString();
    if (activeIssue.category === 'interaction') {
      setPlaygroundLogs(prev => [
        `[${stamp}] Hovering trigger .interactive-modal-trigger`,
        `[${stamp}] PROTOTYPE: Found pointer-events: none override in .css`,
        `[${stamp}] STAGE: Event triggered. Dispached modal-open successfully.`,
        ...prev
      ]);
    } else if (activeIssue.category === 'component') {
      setPlaygroundLogs(prev => [
        `[${stamp}] Triggered slack sync webhook handshakes`,
        `[${stamp}] PROTOTYPE: Navigation error. Invalid dead path: /billing/slack-dead`,
        `[${stamp}] STAGE: Exited sandbox into Slack OAuth setup page.`,
        ...prev
      ]);
    } else {
      setPlaygroundLogs(prev => [
        `[${stamp}] Left-clicked visual inspector boundaries on ${activeIssue.elementSelector}`,
        `[${stamp}] Recalculated spacing matrices -- Diff: 1px drift layout variance`,
        ...prev
      ]);
    }
  };

  if (!completedRun || completedRun.issues.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-gray-100 flex flex-col justify-center items-center h-96" id="empty-state">
        <Sliders className="w-12 h-12 text-gray-300 animate-pulse mb-3" />
        <h3 className="text-sm font-semibold text-gray-700">No discrepancies detected in workspace</h3>
        <p className="text-xs text-gray-400 max-w-sm mt-1">
          Select all 200 screens in the Crawler panel and trigger an automated scan run. Seamless Prototype and Stage delta alignment will list findings here.
        </p>
      </div>
    );
  }

  // Visual replica code depending on selected issue for precise graphic display
  const renderVisualReplica = (isStageVersion: boolean) => {
    if (!activeIssue) return null;
    const visualSeed = activeIssue.screenId;
    const isLogik = activeIssue.id.includes('logik') || visualSeed.includes('admin') || visualSeed.includes('operator') || visualSeed.includes('classification') || visualSeed.includes('extraction') || visualSeed.includes('validation');

    if (visualSeed.includes('2')) {
      // Typography Size Mismatch
      return (
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-950 px-2 py-0.5 rounded-full uppercase">
              {isLogik ? 'Lending Program Core settings' : 'NAV HEADER'}
            </span>
            <h4 
              className="text-white mt-3"
              style={{
                fontFamily: isStageVersion ? '"Inter", sans-serif' : (isLogik ? '"Space Grotesk", sans-serif' : '"Inter", sans-serif'),
                fontSize: isStageVersion ? '20px' : '24px',
                fontWeight: isStageVersion ? '400' : '600',
                margin: isStageVersion ? '24px 0' : '12px 0'
              }}
            >
              {isLogik ? 'Neural AI Stacking Rule Engine' : 'Enterprise CRM Revamp Hub'}
            </h4>
            <div className="w-full h-1 bg-slate-800 rounded-full my-3"></div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
              {isLogik 
                ? 'Ingests hybrid composite mortgage loan PDFs, separates pages into document stacks, and routes low-confidence fields.' 
                : 'Provides detailed pipeline statistics, revenue margins, and commission schedules.'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-full h-8 bg-slate-900 border border-slate-800 rounded-sm"></div>
            <div className="w-12 h-8 bg-slate-900 border border-slate-800 rounded-sm"></div>
          </div>
        </div>
      );
    } else if (visualSeed.includes('8')) {
      // Button Spacing / Size Mismatch
      return (
        <div className="p-6 h-full flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-950 px-2 py-0.5 rounded-full uppercase">
              {isLogik ? 'CONFIDENCE DELEGATOR THRESHOLD' : 'PRIMARY ACTION'}
            </span>
            <h4 className="text-xs font-semibold text-slate-300 font-sans">
              {isLogik ? 'OPERATOR DELEGATION STACK VALUES' : 'CUSTOMER ENROLLMENT FORM'}
            </h4>
            <p className="text-xs text-slate-400">
              {isLogik ? 'Define custom auto-routing thresholds. High confidence limits require fewer reviews.' : 'Pressing submit will trigger instant billing webhook schedules.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id={`dummy-btn-${isStageVersion ? 'stage' : 'proto'}`}
              type="button"
              className="text-xs bg-indigo-600 font-semibold text-white transition-all shadow-sm"
              style={{
                padding: isStageVersion ? '12px 24px' : '8px 16px',
                borderRadius: isStageVersion ? '12px' : '6px',
                backgroundColor: isStageVersion ? '#1d4ed8' : '#2563eb'
              }}
            >
              Apply Stacking Thresholds Override
            </button>
            <span className="text-xs text-slate-400 font-medium cursor-pointer">Cancel reset</span>
          </div>
        </div>
      );
    } else if (visualSeed.includes('14')) {
      // Container card discrepancies (Deep border color variance)
      return (
        <div className="p-6 h-full flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-955 px-2 py-0.5 rounded-full uppercase">
              {isLogik ? 'DOCUMENT CLASSIFIER BOUNDS' : 'CONTAINER BORDER'}
            </span>
            <h4 className="text-xs font-semibold text-slate-300">
              {isLogik ? 'LOAN WORKFILE MAP PREVIEW INDICES' : 'ACME CRM TRANSACTION CONTAINER'}
            </h4>
          </div>
          <div 
            className="p-4 transition-all"
            style={{
              border: isStageVersion ? '2px solid #ef4444' : '1px solid #1e293b',
              boxShadow: isStageVersion ? '0 10px 15px rgba(239, 68, 68, 0.2)' : '0 1px 3px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              backgroundColor: '#070709'
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isLogik ? 'Page stack: W-2 Forms [Idx: 1-3]' : 'ID: #402919'}</span>
              <span className="text-brand-success font-semibold">{isLogik ? '94.2% Match' : '+$4,290.00'}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Last analysis: 2 minutes ago</div>
        </div>
      );
    } else if (visualSeed.includes('3')) {
      // Spanner Database Index / Metric disparity
      return (
        <div className="p-6 h-full flex flex-col justify-between font-mono bg-[#090D16]" id={`spanner-replica-${isStageVersion ? 'stage' : 'proto'}`}>
          <div>
            <div className="flex justify-between items-center border-b border-brand-border/40 pb-2.5">
              <span className="text-[10px] text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-full font-bold uppercase">
                ⚙️ SPANNER DATA INSTANCE
              </span>
              <span className={`text-[10px] font-bold ${isStageVersion ? 'text-brand-danger' : 'text-brand-success'}`}>
                {isStageVersion ? '⚠️ PERF WARNING' : '● DESIGN STANDARDS MATCHED'}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white mt-3 font-sans">
              Google Cloud Spanner Transaction Queries (idx_loans)
            </h4>

            <div className="mt-4 space-y-2.5 text-[11px]">
              <div className="flex justify-between text-slate-400 bg-black/40 p-2 rounded border border-brand-border/30">
                <span>QUERY TEMPLATE</span>
                <span className="text-indigo-400 font-bold text-[10px] truncate max-w-[200px]" title="SELECT * FROM loans WHERE org_id = @id">
                  SELECT * FROM loans WHERE org_id = @id
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-black/30 p-2.5 rounded border border-brand-border/20">
                  <span className="text-[9px] text-slate-500 block">EXECUTION STRATEGY</span>
                  <span className={`font-bold block mt-1 ${isStageVersion ? 'text-brand-danger' : 'text-brand-success'} text-[10px]`}>
                    {isStageVersion ? 'TABLE SCAN (UNINDEXED)' : 'COMPOSITE INDEX'}
                  </span>
                </div>
                <div className="bg-black/30 p-2.5 rounded border border-brand-border/20">
                  <span className="text-[9px] text-slate-500 block font-mono">INDEX KEY</span>
                  <span className="text-slate-300 block truncate font-mono mt-1 text-[10px]" title={isStageVersion ? "PRIMARY" : "idx_loans_by_timestamp_v2"}>
                    {isStageVersion ? 'PRIMARY_KEY' : 'idx_loans_by_timestamp_v2'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="bg-black/20 p-2 rounded border border-brand-border/10">
                  <span className="text-[8px] text-slate-500 block">LATENCY (Avg)</span>
                  <span className={`font-bold font-mono text-xs ${isStageVersion ? 'text-brand-danger' : 'text-brand-success'}`}>
                    {isStageVersion ? '250 ms' : '12 ms'}
                  </span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-brand-border/10">
                  <span className="text-[8px] text-slate-500 block">CPU OVERHEAD</span>
                  <span className={`font-bold font-mono text-xs ${isStageVersion ? 'text-brand-danger' : 'text-slate-350'}`}>
                    {isStageVersion ? '64.2%' : '1.5%'}
                  </span>
                </div>
                <div className="bg-black/20 p-2 rounded border border-brand-border/10">
                  <span className="text-[8px] text-slate-500 block">OPTIMIZATION SLA</span>
                  <span className={`font-bold text-xs ${isStageVersion ? 'text-brand-danger' : 'text-brand-success'}`}>
                    {isStageVersion ? 'BREACHED' : 'PASS'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border/30 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Stage Replication Cluster: us-east4</span>
            <span className="text-brand-accent font-bold">9.8 GB/sec Live</span>
          </div>
        </div>
      );
    } else {
      // Functional click actions playground (Slack Redirect links / Modal states / Live synchronization timers)
      const isSyncMarker = visualSeed.includes('validation-review-1') || visualSeed.includes('1');
      return (
        <div className="p-6 h-full flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 bg-amber-955/40 border border-amber-955 px-2 py-0.5 rounded-full uppercase">
              {isSyncMarker ? 'VOLATILE METADATA MARKER' : 'INTERACTION SANDBOX'}
            </span>
            <h4 className="text-xs font-semibold text-slate-300">
              {isSyncMarker ? 'LOAN PARSING SYNCHRONIZATION UTC TIMER' : 'WORKSPACE SLACK CHANNELS'}
            </h4>
          </div>
          <div className="bg-brand-surface border border-brand-border p-4 rounded text-center">
            {isSyncMarker ? (
              <div className="text-xs font-mono block text-amber-300">
                {isStageVersion ? 'Synced: 14 minutes ago' : 'Synced: 2026-05-28 05:14:02 UTC'}
              </div>
            ) : activeIssue.category === 'interaction' ? (
              <button
                id="interactive-modal-trigger-replica"
                type="button"
                onClick={simulatePlaygroundClick}
                className={`text-xs px-3 py-1.5 bg-black/80 hover:bg-black/95 text-white rounded border border-brand-border ${!isStageVersion ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
              >
                {!isStageVersion ? 'Unavailable' : 'Configure Integration'}
              </button>
            ) : (
              <a
                id="tab-integrations-replica"
                href="#replica-click"
                onClick={(e) => { e.preventDefault(); simulatePlaygroundClick(); }}
                className={`text-xs font-semibold underline block ${!isStageVersion ? 'text-rose-400 hover:text-rose-500' : 'text-blue-400 hover:text-blue-500'}`}
              >
                {!isStageVersion ? 'Connect Slack Sync (Dead Link)' : 'OAuth Connect Slack Channels'}
              </a>
            )}
          </div>
          <p className="text-[10px] text-slate-500 italic">
            {isSyncMarker ? 'Volatile timestamp element requires a masking rule exclusion.' : 'Click button or link above to replay DOM triggers.'}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="compare-workspace">
      {/* Left listing navigation list (4 cols) */}
      <div className="lg:col-span-4 bg-brand-surface p-5 rounded border border-brand-border flex flex-col h-[580px] justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-accent font-bold" /> FINDING LOG
            </h3>
            <span className="text-[10px] bg-brand-danger/10 border border-brand-danger/20 text-brand-danger px-2 py-0.5 rounded font-bold font-mono">
              {filteredIssues.filter(i => i.status === 'pending').length} PENDING
            </span>
          </div>

          {/* Elegant Filter Section */}
          <div className="flex gap-2">
            {/* Severity Filter Dropdown */}
            <div className="relative flex-1" ref={severityRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSeverityOpen(!isSeverityOpen);
                  setIsStatusOpen(false);
                }}
                className="w-full flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-black/40 hover:bg-black/60 rounded border border-brand-border/80 text-custom-gray text-slate-300 font-medium transition"
              >
                <span className="truncate">
                  {selectedSeverities.length === 4 ? 'All Severities' : `Severity (${selectedSeverities.length})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-500 shrink-0 animate-pulse" />
              </button>
              
              {isSeverityOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-brand-surface border border-brand-border rounded shadow-xl z-30 p-2 space-y-1">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2 py-1 border-b border-brand-border/40 mb-1">
                    Select Severities
                  </div>
                  {['Critical', 'Major', 'Minor', 'Clarity Needed'].map((sev) => {
                    const checked = selectedSeverities.includes(sev);
                    return (
                      <label key={sev} className="flex items-center gap-2 px-2 py-1 hover:bg-black rounded cursor-pointer text-xs text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedSeverities(selectedSeverities.filter(s => s !== sev));
                            } else {
                              setSelectedSeverities([...selectedSeverities, sev]);
                            }
                          }}
                          className="rounded border-brand-border bg-black text-brand-accent focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                        />
                        <span>{sev}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative flex-1" ref={statusRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsSeverityOpen(false);
                }}
                className="w-full flex items-center justify-between text-[11px] px-2.5 py-1.5 bg-black/40 hover:bg-black/60 rounded border border-brand-border/80 text-custom-gray text-slate-300 font-medium transition"
              >
                <span className="truncate">
                  {selectedStatuses.length === 3 ? 'All Statuses' : `Status (${selectedStatuses.length})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-500 shrink-0 animate-pulse" />
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-brand-surface border border-brand-border rounded shadow-xl z-30 p-2 space-y-1">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-2 py-1 border-b border-brand-border/40 mb-1">
                    Select Statuses
                  </div>
                  {['pending', 'approved', 'dismissed'].map((st) => {
                    const checked = selectedStatuses.includes(st);
                    const label = st.charAt(0).toUpperCase() + st.slice(1);
                    return (
                      <label key={st} className="flex items-center gap-2 px-2 py-1 hover:bg-black rounded cursor-pointer text-xs text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== st));
                            } else {
                              setSelectedStatuses([...selectedStatuses, st]);
                            }
                          }}
                          className="rounded border-brand-border bg-black text-brand-accent focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedSeverities.length < 4 || selectedStatuses.length < 3) && (
            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-brand-accent/5 border border-brand-accent/18 px-2 py-1.5 rounded">
              <span>Filters active ({filteredIssues.length} found)</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSeverities(['Critical', 'Major', 'Minor', 'Clarity Needed']);
                  setSelectedStatuses(['pending', 'approved', 'dismissed']);
                }}
                className="text-brand-accent hover:underline font-bold"
              >
                Reset
              </button>
            </div>
          )}

          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1.5 scroll-hide">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                No matching discrepancies.
              </div>
            ) : (
              filteredIssues.map((iss) => {
                const isSelected = activeIssue?.id === iss.id;
                let badgeColor = 'bg-slate-800 text-slate-400 border border-brand-border';
                if (iss.severity === 'Critical') badgeColor = 'bg-brand-danger/10 border border-brand-danger/30 text-brand-danger';
                else if (iss.severity === 'Major') badgeColor = 'bg-brand-warning/10 border border-brand-warning/30 text-brand-warning';
                else if (iss.severity === 'Minor') badgeColor = 'bg-brand-accent/10 border border-brand-accent/30 text-brand-accent';

                const catIcons: Record<string, string> = {
                  typography: 'T',
                  layout: 'L',
                  color: 'C',
                  component: 'C',
                  interaction: 'I'
                };

                let statusDotColor = 'bg-brand-danger animate-pulse';
                if (iss.status === 'approved') statusDotColor = 'bg-brand-success';
                else if (iss.status === 'dismissed_false_positive' || iss.status === 'promoted_baseline') statusDotColor = 'bg-slate-500';

                return (
                  <div
                    key={iss.id}
                    onClick={() => selectIssue(iss)}
                    className={`p-3.5 rounded border text-left cursor-pointer transition-all ${isSelected ? 'border-brand-accent bg-brand-accent/10 shadow-lg shadow-brand-accent/5' : 'border-brand-border/60 hover:bg-brand-surface hover:border-brand-border'}`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} title={`Status: ${iss.status}`}></span>
                          <span className="font-bold text-xs text-white block truncate">{iss.screenName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block truncate font-mono">{iss.moduleName}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${badgeColor} shrink-0`}>
                        {iss.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-dashed border-brand-border/80 text-[10px] text-slate-400 justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-sm bg-black/40 text-[9px] font-bold flex items-center justify-center border border-brand-border text-brand-accent">
                          {catIcons[iss.category] || 'M'}
                        </span>
                        <span className="capitalize">{iss.category} diff</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">{iss.type.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 bg-black/20 p-2.5 rounded border border-brand-border font-mono">
          ENVIRONMENT STANDARD BASE: <span className="text-brand-accent">CANDIDATE BR_STAGE</span>
        </div>
      </div>

      {/* Main comparative viewport visualizer is on the right (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {activeIssue ? (
          <>
            {/* Header / Meta detail */}
            <div className="bg-brand-surface p-5 rounded border border-brand-border shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{activeIssue.moduleName} &bull; ROUTE: <span className="text-brand-accent">/{activeIssue.screenId}</span></span>
                  <h2 className="text-base font-bold text-white mt-1">Inconsistency: {activeIssue.screenName}</h2>
                </div>
                <div className="flex items-center gap-1 bg-black/30 p-1 rounded border border-brand-border">
                  <button
                    id="tool-slider-view"
                    type="button"
                    onClick={() => setCompareMode('slider')}
                    className={`p-1.5 rounded transition ${compareMode === 'slider' ? 'bg-brand-accent text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Interactive Split Slider"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    id="tool-side-view"
                    type="button"
                    onClick={() => setCompareMode('side-by-side')}
                    className={`p-1.5 rounded transition ${compareMode === 'side-by-side' ? 'bg-brand-accent text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Parallel Side-by-Side"
                  >
                    <Layout className="w-4 h-4" />
                  </button>
                  <button
                    id="tool-contour-view"
                    type="button"
                    onClick={() => setCompareMode('contour')}
                    className={`p-1.5 rounded transition ${compareMode === 'contour' ? 'bg-brand-accent text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    title="Hot Spot Overlay Blends"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-brand-warning/10 p-3 rounded border border-brand-warning/20 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
                <span>{activeIssue.description}</span>
              </p>
            </div>

            {/* Core Comparative Canvas Sandbox based on compareMode */}
            <div className="bg-brand-surface border border-brand-border rounded overflow-hidden relative">
              {compareMode === 'slider' && (
                <div 
                  ref={sliderRef}
                  onMouseMove={handleSliderMove}
                  onTouchMove={handleSliderMove}
                  className="h-80 w-full relative select-none overflow-hidden bg-brand-surface cursor-ew-resize"
                  id="split-compare-slider"
                >
                  {/* Left Side: PROTOTYPE (Underneath/Background container) */}
                  <div className="absolute inset-0 w-full h-full bg-black/60">
                    <div className="absolute top-2 left-2 bg-brand-accent text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded z-10 uppercase">
                      Prototype Spec
                    </div>
                    {renderVisualReplica(false)}
                  </div>

                  {/* Right Side: STAGE (Clipping Overlay) */}
                  <div 
                    className="absolute inset-y-0 right-0 h-full bg-black/40 border-l border-brand-accent shadow-2xl"
                    style={{ left: `${slidePos}%` }}
                  >
                    <div className="absolute inset-0" style={{ width: sliderRef.current?.getBoundingClientRect().width, left: `-${sliderRef.current?.getBoundingClientRect().width ? (sliderRef.current.getBoundingClientRect().width * slidePos) / 100 : 0}px` }}>
                      <div className="absolute top-2 right-2 bg-brand-warning text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded z-10 uppercase">
                        Stage (Diff Active)
                      </div>
                      {renderVisualReplica(true)}
                    </div>
                  </div>

                  {/* Slider Control Handle bar */}
                  <div 
                    className="absolute inset-y-0 w-1 bg-brand-accent cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${slidePos}%` }}
                  >
                    <div className="w-7 h-7 bg-brand-accent text-white rounded flex items-center justify-center shadow-lg border border-white/20 text-xs font-bold">
                      &harr;
                    </div>
                  </div>
                </div>
              )}

              {compareMode === 'side-by-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-border h-80 bg-black" id="parallel-view">
                  <div className="relative h-full bg-brand-surface/45">
                    <span className="absolute top-2 left-2 bg-brand-accent text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">Prototype Spec</span>
                    {renderVisualReplica(false)}
                  </div>
                  <div className="relative h-full bg-brand-surface/45">
                    <span className="absolute top-2 left-2 bg-brand-warning text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">Stage Baseline</span>
                    {renderVisualReplica(true)}
                  </div>
                </div>
              )}

              {compareMode === 'contour' && (
                <div className="h-80 relative bg-brand-danger/5 flex items-center justify-center overflow-hidden" id="contour-blend-view">
                  <span className="absolute top-2 left-2 bg-brand-danger text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded z-10 uppercase">CONTOUR OVERFLOW DRIFT DETECTORS</span>
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Render with high alpha contour highlights over key tags */}
                    <div className="absolute inset-0 opacity-40 filter mix-blend-multiply">
                      {renderVisualReplica(false)}
                    </div>
                    <div className="absolute inset-0 opacity-40 filter mix-blend-screen">
                      {renderVisualReplica(true)}
                    </div>
                    {/* The Diff Red Accent Block */}
                    <div className="absolute inset-0 bg-[#EF4444]/10 border-2 border-dotted border-brand-danger flex items-center justify-center">
                      <div className="bg-brand-surface/95 border border-brand-danger text-white font-mono font-bold text-xs p-4 rounded shadow-2xl text-center flex flex-col items-center gap-1.5">
                        <AlertTriangle className="w-5 h-5 text-brand-danger" />
                        <span className="tracking-wider uppercase text-brand-danger text-[10px]">PIXEL MISMATCH DETECTED</span>
                        <span className="text-[10px] font-normal text-slate-400">Selector: {activeIssue.elementSelector}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOM Style variables inspect */}
              <div className="bg-black/80 text-slate-300 p-4 border-t border-brand-border text-xs font-mono grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">PROTOTYPE STYLING DOM</span>
                  <div className="bg-black/35 p-2.5 rounded border border-brand-border/60 text-[11px] space-y-1">
                    <div>Element: <span className="text-brand-accent">{activeIssue.elementSelector}</span></div>
                    <div>CSS Value: <span className="text-slate-200">{activeIssue.prototypeValue || "N/A"}</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">STAGE STYLING DOM</span>
                  <div className="bg-black/35 p-2.5 rounded border border-brand-border/60 text-[11px] space-y-1">
                    <div>Element: <span className="text-brand-warning">{activeIssue.elementSelector}</span></div>
                    <div>CSS Value: <span className="text-slate-200">{activeIssue.stageValue || "N/A"}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Playground logs of actions click trails */}
            {playgroundLogs.length > 0 && (
              <div className="bg-black/60 text-emerald-400 font-mono text-[10px] p-3.5 rounded border border-brand-border space-y-1">
                <span className="text-slate-500 block border-b border-brand-border pb-1.5 mb-1.5 font-bold">REPLAY LOG PATH PROTOCOL</span>
                {playgroundLogs.slice(0, 3).map((l, i) => (
                  <div key={i} className="leading-relaxed">&gt; {l}</div>
                ))}
              </div>
            )}

            {/* AI analysis Section with Gemini integration */}
            <div className="bg-brand-surface p-5 rounded border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" /> AI Analyst Root Cause
                </h3>
                <button
                  id="btn-gemini-analyze"
                  type="button"
                  onClick={triggerGeminiAnalysis}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 bg-brand-accent/15 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/25 rounded uppercase font-bold text-[10px] tracking-wider flex items-center gap-1.5 disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                  {aiAnalysisResult ? 'Refresh Breakdown' : 'Diagnose Root Cause'}
                </button>
              </div>

              {isAiLoading ? (
                <div className="space-y-3 py-8 text-center flex flex-col items-center">
                  <Loader className="w-7 h-7 text-brand-accent animate-spin" />
                  <p className="text-xs text-slate-400 font-mono tracking-wide uppercase">Matching DOM geometry maps to search source code discrepancies...</p>
                </div>
              ) : aiAnalysisResult ? (
                <div className="prose prose-invert max-w-none text-xs text-slate-300 bg-black/40 p-4 rounded border border-brand-border leading-relaxed font-mono">
                  <ReactMarkdown>{aiAnalysisResult}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Press &quot;Diagnose Root Cause&quot; to parse variables into local fine-tuned Gemini engines for root-cause speculation.
                </p>
              )}
            </div>

            {/* Action / Review approval block */}
            <div className="bg-brand-surface p-5 rounded border border-brand-border shadow-xs space-y-4">
              {showPeerPrompt && (
                <div className="bg-brand-warning/10 p-4 border border-brand-warning/30 rounded text-xs space-y-3 font-mono animate-fade-in">
                  <div className="flex gap-2">
                    <span className="text-brand-warning font-bold uppercase shrink-0">⚠️ CO-AUDITOR SIGNATURE MANDATED</span>
                    <span className="text-slate-400">Project standard requires team verification signature to overwrite visual baseline standards on the {project.name}.</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="email"
                      placeholder="Enter licensed co-auditor/manager email..."
                      className="grow text-xs px-3 py-1.5 border border-brand-border rounded bg-black/50 text-white placeholder-slate-600 focus:border-brand-accent/50 focus:outline-none"
                      value={peerApprover}
                      onChange={(e) => setPeerApprover(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!peerApprover.includes('@')}
                      onClick={() => handleReviewAction('promoted_baseline', peerApprover)}
                      className="px-4 py-1.5 bg-brand-warning text-black rounded text-[11px] font-bold uppercase shrink-0 disabled:opacity-40 transition"
                    >
                      Authenticate and Overwrite
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPeerPrompt(false)}
                      className="px-2.5 py-1.5 bg-slate-800 text-slate-300 rounded text-[11px] font-bold uppercase shrink-0 hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="grow w-full">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
                    AUDIT SIGN-OFF SIGNATURE NOTES {project.baselineApprovalMode === 'requires_double_reviewer' && <span className="text-brand-warning text-[9px]">(Dual-Sign Active)</span>}
                  </label>
                  <input
                    id="tester-notes-field"
                    type="text"
                    placeholder="Record layout offsets, developer constraints, or promotion overrides..."
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-white placeholder-slate-500 focus:border-brand-accent/50 focus:outline-none transition"
                    value={testerNotes}
                    onChange={(e) => setTesterNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto self-end">
                  <button
                    id="btn-dismiss-false"
                    type="button"
                    onClick={() => handleReviewAction('dismissed_false_positive')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-brand-border rounded text-xs font-semibold tracking-wide uppercase transition"
                  >
                    Dismiss (False Positive)
                  </button>
                  <button
                    id="btn-promote-baseline"
                    type="button"
                    onClick={() => handleReviewAction('promoted_baseline')}
                    className="px-3.5 py-2 bg-brand-success/10 hover:bg-brand-success/20 text-brand-success border border-brand-success/30 rounded text-xs font-semibold tracking-wide uppercase transition"
                  >
                    Promote to Baseline
                  </button>
                  <button
                    id="btn-sign-ok"
                    type="button"
                    onClick={() => handleReviewAction('approved')}
                    className="px-3.5 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded text-xs font-semibold tracking-wide uppercase shadow-lg shadow-brand-accent/25 transition"
                  >
                    Approve Variance
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-brand-surface p-12 text-center rounded border border-brand-border h-[580px] flex flex-col items-center justify-center">
            <Sliders className="w-12 h-12 text-brand-border/40 mb-2 animate-bounce" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase">Sandbox Empty</h3>
            <p className="text-xs text-slate-400 mt-1.5">Launch a regression test crawl first to load design variables.</p>
          </div>
        )}
      </div>
    </div>
  );
}
