import React, { useState, useEffect } from 'react';
import { Project, TestRun, Module, Severity, Issue } from '../types';
import { ENTERPRISE_MODULES, SEEDED_SCREENS } from '../data/screensData';
import { Play, ToggleLeft, ToggleRight, CheckSquare, Square, ChevronDown, ChevronRight, Activity, Terminal, Shield, EyeOff, Loader, RefreshCw } from 'lucide-react';

interface LiveCrawlerConsoleProps {
  project: Project;
  onCrawlComplete: (newRun: TestRun) => void;
  activeRun: TestRun | null;
  setActiveRun: (run: TestRun | null) => void;
}

export default function LiveCrawlerConsole({ project, onCrawlComplete, activeRun, setActiveRun }: LiveCrawlerConsoleProps) {
  const isLogik = project.id === 'logikintake-tenant';
  const modulesList = isLogik ? [
    { id: 'admin-setup', name: 'Admin Setup Hub' },
    { id: 'operator-setup', name: 'Operator Setup Desk' },
    { id: 'classification-review', name: 'Classification Review Stack' },
    { id: 'extraction-review', name: 'Extraction Review Mapping' },
    { id: 'validation-review', name: 'Validation Review Rulebook' },
    { id: 'database-sync', name: 'Spanner Database Sync' }
  ] : ENTERPRISE_MODULES;

  const screensList = isLogik ? [
    { id: 'admin-setup-2', moduleId: 'admin-setup', name: 'Rule Config Hub', path: '/admin-setup/config-hub', type: 'page', elements: { prototype: [], stage: [] } },
    { id: 'operator-setup-8', moduleId: 'operator-setup', name: 'Operator Assignment Panel', path: '/operator-setup/view-8', type: 'page', elements: { prototype: [], stage: [] } },
    { id: 'classification-review-14', moduleId: 'classification-review', name: 'Document Separator Card', path: '/classification-review/view-14', type: 'page', elements: { prototype: [], stage: [] } },
    { id: 'extraction-review-12', moduleId: 'extraction-review', name: 'Webhook Integration Route', path: '/extraction-review/view-12', type: 'page', elements: { prototype: [], stage: [] } },
    { id: 'validation-review-1', moduleId: 'validation-review', name: 'Live Volatile Sync Marker', path: '/validation-review/view-1', type: 'page', elements: { prototype: [], stage: [] } },
    { id: 'database-sync-3', moduleId: 'database-sync', name: 'Spanner Database Console', path: '/database-sync/view-3', type: 'page', elements: { prototype: [], stage: [] } }
  ] : SEEDED_SCREENS;

  const [selectedScreens, setSelectedScreens] = useState<string[]>(project.selectedRoutes);
  const [expandedModule, setExpandedModule] = useState<string | null>(isLogik ? 'admin-setup' : 'analytics');
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [backendScreenCount, setBackendScreenCount] = useState<number>(50);
  const [isBackendRunning, setIsBackendRunning] = useState<boolean>(false);

  const triggerBackendCrawl = async () => {
    setIsBackendRunning(true);
    setLogs([
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: '[Layer 1] Dispatched remote browser audit query to Backend Orchestrator...' },
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `[Layer 3] Target Count: ${backendScreenCount} screens standard across both environments.` }
    ]);

    try {
      const res = await fetch('/api/crawler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, screenCount: backendScreenCount })
      });
      const data = await res.json();
      
      if (data.success && data.testRun) {
        setLogs(data.testRun.logs || []);
        onCrawlComplete(data.testRun);
      } else {
        setLogs(prev => [
          { timestamp: new Date().toLocaleTimeString(), level: 'error', message: 'Backend execution failed. Response is missing active testRun headers.' },
          ...prev
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [
        { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `Backend execution error: ${err.message || err}` },
        ...prev
      ]);
    } finally {
      setIsBackendRunning(false);
    }
  };

  // Synchronize dynamic selections when active tenant scope switches
  useEffect(() => {
    setSelectedScreens(project.selectedRoutes);
    setExpandedModule(isLogik ? 'admin-setup' : 'analytics');
    setLogs([]);
    setCrawlProgress(0);
    setIsRunning(false);
    setIsBackendRunning(false);
  }, [project]);

  // Group screens by module ID
  const screensByModule = modulesList.reduce((acc, m) => {
    acc[m.id] = screensList.filter(s => s.moduleId === m.id);
    return acc;
  }, {} as Record<string, any[]>);

  const handleToggleScreen = (id: string) => {
    if (selectedScreens.includes(id)) {
      setSelectedScreens(selectedScreens.filter(s => s !== id));
    } else {
      setSelectedScreens([...selectedScreens, id]);
    }
  };

  const handleSelectAllInModule = (moduleId: string) => {
    const ids = screensByModule[moduleId].map(s => s.id);
    const someUnselected = ids.some(id => !selectedScreens.includes(id));
    if (someUnselected) {
      setSelectedScreens([...Array.from(new Set([...selectedScreens, ...ids]))]);
    } else {
      setSelectedScreens(selectedScreens.filter(id => !ids.includes(id)));
    }
  };

  const handleSelectAll200 = () => {
    setSelectedScreens(screensList.map(s => s.id));
  };

  const handleClearAll = () => {
    setSelectedScreens([]);
  };

  // Simulating the autonomous crawl workflow
  useEffect(() => {
    if (!isRunning) return;

    let timer: NodeJS.Timeout;
    const totalToScan = selectedScreens.length || 1;
    let index = 0;

    const stabilizationMs = project.crawlStabilizationWaitMs || 450;
    const retryMax = project.retryAttempts || 3;
    const isSessionRec = project.enableSessionRecovery !== false;
    const isAntiHal = project.enableAntiHallucination !== false;
    const isLiveDataIgnore = project.enableLiveDataIgnoreSelector !== false;
    const isReplayLog = project.enableInteractionReplayLogging !== false;

    const crawlSteps = [
      `Preserving active login context via session failover cookie sync... [Recovery: ${isSessionRec ? 'ACTIVE' : 'INACTIVE'}]`,
      `Validating candidate page using stabilization wait timer of ${stabilizationMs}ms...`,
      `Filtering volatile variables through anti-hallucination logic... [Anti-Hallucination: ${isAntiHal ? 'ENABLED' : 'DISABLED'}]`,
      isLiveDataIgnore ? `Ignoring layout variance on masked live dynamic selector counts...` : `Warning: Dynamic content normalization is disabled in config.`,
      `Clicking active DOM nodes & capturing interaction-state coordinates... [Replay: ${isReplayLog ? 'COMPREHENSIVE' : 'STANDARD'}]`,
      `Reviewing visual diff maps against pixel delta threshold limit of ${((project.screenshotDiffThresholdPercent || 0.05)*100).toFixed(0)}%...`,
      `Attempt 1 of ${retryMax}: Checking if viewport CSS canvas is fully stable...`,
      `Result: 100% stable rendering confirmed. Mapping complete hierarchy tree components.`
    ];

    const runSimulation = () => {
      if (index >= totalToScan) {
        setIsRunning(false);
        // Complete Test Run Setup
        // Find mismatches in selected routes
        const selectedMismatches = screensList.filter(s => {
          if (!selectedScreens.includes(s.id)) return false;
          return true; // Match all selected items for simulation
        });

        const issues: Issue[] = selectedMismatches.map((s, idx) => {
          // Identify precise differences
          const isVisual = s.id.includes('2') || s.id.includes('8') || s.id.includes('14');
          
          let severity: Severity = 'Minor';
          let category: 'layout' | 'typography' | 'color' | 'component' | 'interaction' = 'layout';
          let desc = '';
          let root = '';
          let pVal = '';
          let sVal = '';

          if (isLogik) {
            if (s.id.includes('2')) {
              severity = 'Critical';
              category = 'typography';
              desc = 'Prototype defines display-heading typography with weighted Space Grotesk at 24px, while Stage loads default Sans-serif at 20px regular, causing extreme aesthetic mismatch on AI-native intake branding.';
              root = 'Incorrect CSS font inheritance rule in stage deploy code.';
              pVal = 'Font-Size: 24px, Font-Family: Space Grotesk, Weight: 600';
              sVal = 'Font-Size: 20px, Font-Family: Inter, Weight: 400';
            } else if (s.id.includes('8')) {
              severity = 'Major';
              category = 'layout';
              desc = 'Button padding is misaligned in Stage (12px 24px, rounded-xl 12px) compared to the Prototype standard (8px 16px, rounded-md 6px), breaking spacing alignments on the multi-tenant delegation dashboard.';
              root = 'Stale style class tags in stage candidate build branch.';
              pVal = 'Padding: 8px 16px, Border-Radius: 6px, Color: #2563eb';
              sVal = 'Padding: 12px 24px, Border-Radius: 12px, Color: #1d4ed8 (Slightly darker)';
            } else if (s.id.includes('14')) {
              severity = 'Major';
              category = 'color';
              desc = 'High priority mismatch: Stage displays a crimson red border highlight boundary on page stack preview nodes instead of clean neutral boundaries, suggesting false-positive error triggers to the intake validators.';
              root = 'Default verification CSS variables mapped wrongly.';
              pVal = 'Border: 1px solid #e5e7eb, Shadow: Light';
              sVal = 'Border: 2px solid #ef4444 (Crimson), Shadow: Expanded Outline Mismatch';
            } else if (s.id.includes('12')) {
              severity = 'Minor';
              category = 'component';
              desc = 'Prototype redirect points to live workspace webhook integrations, but Stage redirects to dead path, blocking seamless automated Slack sync alert setup.';
              root = 'Incorrect anchor href bindings generated on candidate package deployment tags.';
              pVal = 'Href Target: slack://connect-oauth-hub';
              sVal = 'Href Target: /billing/slack-dead-endpoint (404 Broken Redirect)';
            } else if (s.id.includes('3')) {
              severity = 'Critical';
              category = 'component';
              desc = 'Database query mismatch in stage. The Spanner staging cluster displays unindexed queries with high execution latency (250ms) on schema transaction indexes, whereas the prototype configuration defines a highly optimized 12ms secondary index.';
              root = 'Missing index definitions in the candidate database migration script.';
              pVal = 'Secondary Index: idx_loans_by_timestamp_v2, Latency: 12ms';
              sVal = 'Table Scan (Unindexed), Latency: 250ms, Error: Query Warning SLA breached';
            } else {
              severity = 'Clarity Needed';
              category = 'interaction';
              desc = 'Target synchronization marker timestamp varies constantly between volatile runs. Candidate stage is using local relative strings "Synced: 14 mins ago" while Prototype logs absolute UTC metadata, creating discrepancy mapping errors.';
              root = 'Volatile timestamp element configuration needs masking rule exclusion.';
              pVal = 'Synced: 2026-05-28 05:14:02 UTC';
              sVal = 'Synced: 14 minutes ago';
            }
          } else {
            if (s.id.includes('2')) {
              severity = 'Major';
              category = 'typography';
              desc = 'Font size and font weight mismatch in header. Title text shrinks from 24px semi-bold to 20px regular, causing layout line wraps.';
              root = 'Header title styles configured differently in Stage vs Prototype.';
              pVal = 'Font-Size: 24px, Font-Weight: 600 (Semibold)';
              sVal = 'Font-Size: 20px, Font-Weight: 400 (Regular)';
            } else if (s.id.includes('8')) {
              severity = 'Minor';
              category = 'layout';
              desc = 'Action item button padding and border-radius drift. Button is oversized and uses wrong variables.';
              root = 'Border radius and padding mismatch on primary action buttons.';
              pVal = 'Padding: 8px 16px, Radius: 6px';
              sVal = 'Padding: 12px 24px, Radius: 12px';
            } else if (s.id.includes('14')) {
              severity = 'Critical';
              category = 'color';
              desc = 'Primary visual card contains a bright red border mismatch instead of default grey. Deep shadow differences found.';
              root = 'Stage element override changes table box styling border and shadow colors.';
              pVal = 'Border: 1px solid #e5e7eb, Shadow: Light';
              sVal = 'Border: 2px solid #ef4444, Shadow: High Intensity Red Highlight';
            } else if (s.id.includes('5')) {
              severity = 'Major';
              category = 'interaction';
              desc = 'Interactive Settings trigger does not display feedback cursor click on hover due to prototype element pointer-events none.';
              root = 'Button click action is missing transition listener on Prototype build.';
              pVal = 'Opacity: 0.5, pointer-events: none (Unclickable)';
              sVal = 'Opacity: 1.0, cursor-pointer (Interactive)';
            } else {
              severity = 'Critical';
              category = 'component';
              desc = 'Route transition broken. "Slack Sync" navigation anchor links to raw route protocol on Prototype instead of genuine OAuth setup.';
              root = 'Integrations tab redirect URL mapping contains dead prototype link routing path.';
              pVal = 'Anchor: Connect Slack Sync';
              sVal = 'OAuth URL: slack://connect-oauth';
            }
          }

          return {
            id: `iss-${s.id}-${Date.now()}`,
            testRunId: `run-${Date.now()}`,
            screenId: s.id,
            screenName: s.name,
            moduleId: s.moduleId,
            moduleName: modulesList.find(em => em.id === s.moduleId)?.name || '',
            type: isVisual ? 'visual' as const : 'functional' as const,
            category,
            componentName: s.id.includes('2') ? '.page-title' : s.id.includes('8') ? '.action-btn-primary' : s.id.includes('14') ? '.data-grid-container' : s.id.includes('3') ? '.database-schema-grid' : '.interactive-modal-trigger',
            severity,
            elementSelector: s.id.includes('2') ? '.page-title' : s.id.includes('8') ? '.action-btn-primary' : s.id.includes('14') ? '.data-grid-container' : s.id.includes('3') ? '.database-schema-grid' : '.interactive-modal-trigger',
            description: desc,
            rootCause: root,
            prototypeValue: pVal,
            stageValue: sVal,
            status: 'pending' as const
          };
        });

        const completedRun: TestRun = {
          id: `run-${Date.now()}`,
          projectId: project.id,
          date: new Date().toISOString(),
          status: 'completed',
          screensScanned: totalToScan,
          totalScreensCount: isLogik ? 100 : 200,
          criticalCount: issues.filter(i => i.severity === 'Critical').length,
          majorCount: issues.filter(i => i.severity === 'Major').length,
          minorCount: issues.filter(i => i.severity === 'Minor').length,
          clarityCount: issues.filter(i => i.severity === 'Clarity Needed').length,
          durationMs: totalToScan * 450 + 1200,
          issues,
          logs: [
            ...logs,
            { timestamp: new Date().toISOString(), level: 'info', message: `Crawling finished successfully. ${isLogik ? 'LogikIntake Config Hub' : 'Enterprise CRM Core'} workspace mapping completed.` },
            { timestamp: new Date().toISOString(), level: 'info', message: `Found ${issues.length} environment discrepancies. Ready for Human-in-Loop approval.` }
          ]
        };

        onCrawlComplete(completedRun);
        setActiveRun(null);
        return;
      }

      const activeScreen = screensList.find(s => s.id === selectedScreens[index]);
      if (!activeScreen) {
        index++;
        setCrawlProgress(Math.min(100, Math.floor((index / totalToScan) * 100)));
        timer = setTimeout(runSimulation, 50);
        return;
      }

      // Roll logging
      const stepIdx = index % crawlSteps.length;
      const progressPercent = Math.min(100, Math.floor((index / totalToScan) * 100));
      
      let level: 'info' | 'warn' | 'error' = 'info';
      if (activeScreen.id.includes('2')) level = 'warn';
      if (activeScreen.id.includes('14')) level = 'error';

      const newLog = {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message: `[Screen: ${activeScreen.name}] ${crawlSteps[stepIdx]}`
      };

      setLogs(prev => [newLog, ...prev.slice(0, 40)]);
      setCrawlProgress(progressPercent);
      index++;

      timer = setTimeout(runSimulation, project.crawlStabilizationWaitMs || 350);
    };

    timer = setTimeout(runSimulation, project.crawlStabilizationWaitMs || 350);

    return () => clearTimeout(timer);
  }, [isRunning]);

  const startCrawl = () => {
    if (selectedScreens.length === 0) return;
    setLogs([
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Initiating global multi-tenant baseline crawl run...' },
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Targeting URLs -- Prototype: ${project.prototypeUrl} vs Stage: ${project.stageUrl}` }
    ]);
    setIsRunning(true);
    setCrawlProgress(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="crawler-console">
      {/* Route mapping list selector (8 cols) */}
      <div className="lg:col-span-7 bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-warning" /> SCREEN SUITE SELECTOR
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Select which routes and screen states to crawl autonomously (Max: 200 catalog states).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              id="crawl-sel-all"
              type="button"
              onClick={handleSelectAll200}
              className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-black/60 hover:bg-black/80 text-slate-300 rounded border border-brand-border transition"
            >
              Select All 200
            </button>
            <button
              id="crawl-clear-all"
              type="button"
              onClick={handleClearAll}
              className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-brand-danger/10 hover:bg-brand-danger/25 text-brand-danger rounded border border-brand-danger/30 transition"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Modules Accordion */}
        <div className="border border-brand-border rounded overflow-y-auto max-h-[480px] divide-y divide-brand-border scroll-hide">
          {ENTERPRISE_MODULES.map((m) => {
            const hasSubsetSelected = screensByModule[m.id]?.some(s => selectedScreens.includes(s.id));
            const allSubsetSelected = screensByModule[m.id]?.every(s => selectedScreens.includes(s.id));
            const isExpanded = expandedModule === m.id;

            return (
              <div key={m.id} className="bg-brand-surface">
                <div 
                  className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-black/30 transition ${isExpanded ? 'bg-black/20' : ''}`}
                  onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      id={`check-module-${m.id}`}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelectAllInModule(m.id); }}
                      className="text-slate-500 hover:text-brand-accent transition"
                    >
                      {allSubsetSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-accent" />
                      ) : hasSubsetSelected ? (
                        <span className="w-4 h-4 inline-block bg-brand-accent/25 text-brand-accent font-bold text-[10px] text-center rounded leading-none select-none">-</span>
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-slate-200">{m.name.toUpperCase()}</span>
                    <span className="text-[10px] bg-black/40 text-brand-accent px-2 py-0.5 rounded font-mono border border-brand-border/60">
                      {screensByModule[m.id]?.filter(s => selectedScreens.includes(s.id)).length} / 20 SECTIONS
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Sublist */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-2 bg-black/15 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-t border-brand-border">
                    {screensByModule[m.id]?.map((s) => {
                      const isChecked = selectedScreens.includes(s.id);
                      let styleTag = "text-slate-300 hover:text-white";
                      if (s.id.includes('2') || s.id.includes('14')) styleTag = "text-brand-warning/95 hover:text-brand-warning";
                      
                      return (
                        <label 
                          key={s.id} 
                          className="flex items-center gap-2.5 py-1 select-none cursor-pointer text-xs"
                        >
                          <input
                            id={`check-screen-${s.id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleScreen(s.id)}
                            className="rounded border-brand-border bg-black text-brand-accent font-mono focus:ring-0"
                          />
                          <div className="truncate shrink-0 grow">
                            <span className={`font-mono text-[9px] mr-1.5 bg-black/40 border border-brand-border p-1 rounded font-bold text-slate-500`}>
                              {s.type.toUpperCase()}
                            </span>
                            <span className={`${styleTag} font-sans`}>{s.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Runner progress details (5 cols) */}
      <div className="lg:col-span-5 bg-brand-surface p-6 rounded border border-brand-border shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-accent" /> AUTONOMOUS TESTER STATUS
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepting target environment tokens, executing visual difference and functional regression runs.
          </p>
        </div>

        {/* Deterministic Engine Dashboard Badge */}
        <div className="bg-black/40 p-4 border border-brand-border/60 rounded text-xs space-y-3 font-mono">
          <div className="text-[10px] text-slate-500 font-bold border-b border-brand-border/40 pb-1.5 flex items-center justify-between">
            <span>DETERMINISM CONTROLLER</span>
            <span className="text-brand-accent animate-pulse">● STABLE STATE</span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] text-slate-300">
            <div className="flex justify-between border-r border-brand-border/30 pr-3">
              <span className="text-slate-500 uppercase">Wait Delay</span>
              <span className="text-brand-warning font-bold">{project.crawlStabilizationWaitMs || 450}ms</span>
            </div>
            <div className="flex justify-between pl-1">
              <span className="text-slate-500 uppercase">Retry Limit</span>
              <span className="text-white font-bold">{project.retryAttempts || 3}x Max</span>
            </div>
            <div className="flex justify-between border-r border-brand-border/30 pr-3 pt-1 border-t border-brand-border/20">
              <span className="text-slate-500 uppercase">Tolerance</span>
              <span className="text-brand-accent font-bold">{((project.screenshotDiffThresholdPercent || 0.05)*100).toFixed(0)}% Diff</span>
            </div>
            <div className="flex justify-between pl-1 pt-1 border-t border-brand-border/20">
              <span className="text-slate-500 uppercase">Promotion</span>
              <span className="text-slate-300 font-bold max-w-[70px] truncate" title={project.baselineApprovalMode || 'requires_reviewer'}>
                {project.baselineApprovalMode === 'instant' ? 'Instant' : project.baselineApprovalMode === 'requires_double_reviewer' ? 'Dual-Audit' : 'Aproved-Req'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 text-[9px] text-slate-500 border-t border-brand-border/40 flex flex-wrap gap-1.5">
            <span className={`px-1.5 py-0.5 rounded ${project.enableAntiHallucination !== false ? 'bg-indigo-950/45 text-indigo-400 border border-indigo-950' : 'bg-slate-900 text-slate-600'}`}>
              🛡️ Anti-Hallucination
            </span>
            <span className={`px-1.5 py-0.5 rounded ${project.enableLiveDataIgnoreSelector !== false ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-950' : 'bg-slate-900 text-slate-600'}`}>
              🏷️ Normalizer
            </span>
            <span className={`px-1.5 py-0.5 rounded ${project.enableInteractionReplayLogging !== false ? 'bg-blue-950/45 text-blue-400 border border-blue-950' : 'bg-slate-900 text-slate-600'}`}>
              📝 Replay Logs
            </span>
            <span className={`px-1.5 py-0.5 rounded ${project.enableSessionRecovery !== false ? 'bg-amber-950/45 text-amber-400 border border-amber-950' : 'bg-slate-900 text-slate-600'}`}>
              🔄 Session Failover
            </span>
          </div>
          {project.whitelistRoutesRegex && (
            <div className="text-[9px] text-slate-500 truncate pt-1 uppercase">
              Route RegExp: <span className="text-brand-accent font-mono">{project.whitelistRoutesRegex}</span>
            </div>
          )}
        </div>

        {/* Progress Display */}
        <div className="bg-black/30 p-5 rounded border border-brand-border text-center space-y-3">
          {isRunning || isBackendRunning ? (
            <div className="space-y-3">
              <Loader className="w-8 h-8 text-brand-accent animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300 animate-pulse tracking-wide font-mono uppercase">
                {isBackendRunning ? 'Processing Backend Orchestrator...' : 'Crawling routes...'} ({isBackendRunning ? '100%' : `${crawlProgress}%`})
              </p>
              <div className="w-full bg-black/40 h-2 rounded overflow-hidden border border-brand-border">
                <div className="bg-brand-accent h-2 transition-all duration-300" style={{ width: `${isBackendRunning ? 100 : crawlProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {isBackendRunning 
                  ? 'COMMUNICATING WITH TEMPORAL COMPLIANCE ENGINE'
                  : `ACTIVE IDENTITY: ${project.credentials[0]?.role.toUpperCase()} SESSION SYNCED`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Local Browser Simulator */}
              <div className="border border-brand-border/40 bg-black/15 p-3 px-3.5 rounded text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-brand-accent" /> LOCAL CLIENT DISPATCHER
                  </span>
                  <span className="text-[9px] bg-brand-border/40 px-1.5 py-0.5 rounded font-mono text-slate-400">
                    Selected: {selectedScreens.length}
                  </span>
                </div>
                <button
                  id="btn-trigger-crawl"
                  type="button"
                  onClick={startCrawl}
                  disabled={selectedScreens.length === 0}
                  className="w-full py-2 bg-brand-accent hover:bg-blue-600 disabled:bg-black/40 disabled:text-slate-600 disabled:border-brand-border/40 text-white text-xs font-bold uppercase tracking-wider rounded transition border border-brand-accent/20"
                >
                  Run Local Selection ({selectedScreens.length})
                </button>
              </div>

              {/* Backend Scale Orchestration */}
              <div className="border border-brand-border/40 bg-black/15 p-3 px-3.5 rounded text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-warning uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-brand-warning" /> BACKEND CLUSTERING PIPELINE
                  </span>
                  <span className="text-[9px] bg-indigo-950/45 text-indigo-400 border border-indigo-950 px-1.5 py-0.5 rounded font-mono font-bold">
                    UNLIMITED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Inspect and audit any custom quantity of screen states dynamically on the Node server.
                </p>
                
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-sans block uppercase font-bold">Crawl Capacity (Screen Count):</span>
                  <select
                    id="backend-screen-count"
                    value={backendScreenCount}
                    onChange={(e) => setBackendScreenCount(parseInt(e.target.value, 10))}
                    className="w-full bg-black text-white px-2 py-1 flex items-center rounded border border-brand-border text-[11px] font-mono font-bold"
                  >
                    <option value={6}>6 Screens (Selected Catalog Items)</option>
                    <option value={20}>20 Screens (Subscale Module Audit)</option>
                    <option value={50}>50 Screens (Standard Tenant Workspace)</option>
                    <option value={100}>100 Screens (High Density Enterprise Stack)</option>
                    <option value={180}>180 Screens (Full Suite Regression SLA)</option>
                  </select>
                </div>

                <button
                  id="btn-trigger-backend"
                  type="button"
                  onClick={triggerBackendCrawl}
                  className="w-full py-2 bg-brand-success hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded transition border border-brand-success/20 shadow-lg shadow-brand-success/10"
                >
                  Dispatch Backend Run
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Console Streaming Logs */}
        <div className="border border-brand-border bg-black/70 text-emerald-400 p-4 rounded font-mono text-[10px] h-60 overflow-y-auto space-y-1.5 scroll-hide">
          <div className="flex items-center gap-1.5 text-slate-400 border-b border-brand-border pb-2 mb-2 font-bold">
            <Terminal className="w-3.5 h-3.5 text-brand-success" />
            <span>CONSOLE STREAM REPLAY PROTOCOL</span>
          </div>
          {logs.length === 0 && (
            <span className="text-slate-600 italic block font-mono">Crawler offline. Trigger workspace crawl to inspect active socket...</span>
          )}
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2 leading-relaxed">
              <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={log.level === 'error' ? 'text-brand-danger font-bold' : log.level === 'warn' ? 'text-brand-warning font-bold' : 'text-brand-success font-bold'}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-slate-300 font-sans">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
