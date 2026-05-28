import React, { useState, useEffect } from 'react';
import { Project, TestRun } from './types';
import ConfigPanel from './components/ConfigPanel';
import LiveCrawlerConsole from './components/LiveCrawlerConsole';
import SnoopCompareWorkspace from './components/SnoopCompareWorkspace';
import AuditHistoryPanel from './components/AuditHistoryPanel';
import OSArchitecturePanel from './components/OSArchitecturePanel';
import { Eye, Settings, Activity, History, Shield, RefreshCw, Layers, CheckSquare, Sparkles, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'review' | 'crawler' | 'config' | 'history' | 'blueprint'>('review');
  const [project, setProject] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activeIssueId, setActiveIssueId] = useState<string | undefined>(undefined);
  const [isPreloading, setIsPreloading] = useState(true);

  // Fetch initial project config on startup
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProjectsList(data);
          setProject(data[0]);
        }
        setIsPreloading(false);
      })
      .catch(err => {
        console.error('Failed to load project config:', err);
        setIsPreloading(false);
      });
  }, []);

  // Seed initial completed execution depending on the active project
  useEffect(() => {
    if (!project) return;

    let baseRunList: TestRun[] = [];

    if (project.id === 'logikintake-tenant') {
      const logikRun: TestRun = {
        id: 'run-logikintake-review',
        projectId: 'logikintake-tenant',
        date: new Date(Date.now() - 1200000).toISOString(),
        status: 'completed',
        screensScanned: 6,
        totalScreensCount: 100,
        criticalCount: 2,
        majorCount: 2,
        minorCount: 1,
        clarityCount: 1,
        durationMs: 7800,
        logs: [
          { timestamp: '12:05:10 PM', level: 'info', message: 'Initialized secure automated browser instance for LogikIntake Config Hub.' },
          { timestamp: '12:05:12 PM', level: 'info', message: 'Authenticating with role "admin" using tenant admin@logikcore.com credentials...' },
          { timestamp: '12:05:15 PM', level: 'info', message: 'Successfully authenticated. Accessing /platform/logikintake/admin/config-hub.' },
          { timestamp: '12:05:22 PM', level: 'warn', message: 'Variance detected at rule configuration viewport node (.extraction-rule-set).' }
        ],
        issues: [
          {
            id: 'iss-logik-1',
            testRunId: 'run-logikintake-review',
            screenId: 'admin-setup-2',
            screenName: 'Rule Config Hub',
            moduleId: 'admin-setup',
            moduleName: 'Admin Setup Hub',
            type: 'visual',
            category: 'typography',
            componentName: 'Page Title',
            severity: 'Critical',
            elementSelector: '.page-title',
            description: 'Prototype defines display-heading typography with weighted Space Grotesk at 24px, while Stage loads default Sans-serif at 20px regular, causing extreme aesthetic mismatch on AI-native intake branding.',
            rootCause: 'Incorrect CSS font inheritance rule in stage deploy code.',
            prototypeValue: 'Font-Size: 24px, Font-Family: Space Grotesk, Weight: 600',
            stageValue: 'Font-Size: 20px, Font-Family: Inter, Weight: 400',
            status: 'pending'
          },
          {
            id: 'iss-logik-2',
            testRunId: 'run-logikintake-review',
            screenId: 'operator-setup-8',
            screenName: 'Operator Assignment Panel',
            moduleId: 'operator-setup',
            moduleName: 'Operator Setup Desk',
            type: 'visual',
            category: 'layout',
            componentName: '.action-btn-primary',
            severity: 'Major',
            elementSelector: '.action-btn-primary',
            description: 'Button padding is misaligned in Stage (12px 24px, rounded-xl 12px) compared to the Prototype standard (8px 16px, rounded-md 6px), breaking spacing alignments on the multi-tenant delegation dashboard.',
            rootCause: 'Stale style class tags in stage candidate build branch.',
            prototypeValue: 'Padding: 8px 16px, Border-Radius: 6px, Color: #2563eb',
            stageValue: 'Padding: 12px 24px, Border-Radius: 12px, Color: #1d4ed8 (Slightly darker)',
            status: 'pending'
          },
          {
            id: 'iss-logik-3',
            testRunId: 'run-logikintake-review',
            screenId: 'classification-review-14',
            screenName: 'Document Separator Card',
            moduleId: 'classification-review',
            moduleName: 'Classification Review Stack',
            type: 'visual',
            category: 'color',
            componentName: '.data-grid-container',
            severity: 'Major',
            elementSelector: '.data-grid-container',
            description: 'High priority mismatch: Stage displays a crimson red border highlight boundary on page stack preview nodes instead of clean neutral boundaries, suggesting false-positive error triggers to the intake validators.',
            rootCause: 'Default verification CSS variables mapped wrongly.',
            prototypeValue: 'Border: 1px solid #e5e7eb, Shadow: Minimal Accent',
            stageValue: 'Border: 2px solid #ef4444 (Crimson), Shadow: Expanded Outline Mismatch',
            status: 'pending'
          },
          {
            id: 'iss-logik-4',
            testRunId: 'run-logikintake-review',
            screenId: 'extraction-review-12',
            screenName: 'Webhook Integration Route',
            moduleId: 'extraction-review',
            moduleName: 'Extraction Review Mapping',
            type: 'functional',
            category: 'component',
            componentName: '.nav-tab-integrations',
            severity: 'Minor',
            elementSelector: '.nav-tab-integrations',
            description: 'Prototype redirect points to live workspace webhook integrations, but Stage redirects to dead path, blocking seamless automated Slack sync alert setup.',
            rootCause: 'Incorrect anchor href bindings generated on candidate package deployment tags.',
            prototypeValue: 'Href Target: slack://connect-oauth-hub',
            stageValue: 'Href Target: /billing/slack-dead-endpoint (404 Broken Redirect)',
            status: 'pending'
          },
          {
            id: 'iss-logik-5',
            testRunId: 'run-logikintake-review',
            screenId: 'validation-review-1',
            screenName: 'Live Volatile Sync Marker',
            moduleId: 'validation-review',
            moduleName: 'Validation Review Rulebook',
            type: 'functional',
            category: 'interaction',
            componentName: '.sync-timestamp',
            severity: 'Clarity Needed',
            elementSelector: '.sync-timestamp',
            description: 'Target synchronization marker timestamp varies constantly between volatile runs. Candidate stage is using local relative strings "Synced: 14 mins ago" while Prototype logs absolute UTC metadata, creating discrepancy mapping errors.',
            rootCause: 'Volatile timestamp element configuration needs masking rule exclusion.',
            prototypeValue: 'Synced: 2026-05-28 05:14:02 UTC',
            stageValue: 'Synced: 14 minutes ago',
            status: 'pending'
          },
          {
            id: 'iss-logik-6',
            testRunId: 'run-logikintake-review',
            screenId: 'database-sync-3',
            screenName: 'Spanner Sync Console',
            moduleId: 'database-sync',
            moduleName: 'Spanner Database Sync',
            type: 'functional',
            category: 'component',
            componentName: '.database-schema-grid',
            severity: 'Critical',
            elementSelector: '.database-schema-grid',
            description: 'Database query mismatch in stage. The Spanner staging cluster displays unindexed queries with high execution latency (250ms) on schema transaction indexes, whereas the prototype configuration defines a highly optimized 12ms secondary index.',
            rootCause: 'Missing index definitions in the candidate database migration script.',
            prototypeValue: 'Secondary Index: idx_loans_by_timestamp_v2, Latency: 12ms',
            stageValue: 'Table Scan (Unindexed), Latency: 250ms, Error: Query Warning SLA breached',
            status: 'pending'
          }
        ]
      };
      baseRunList = [logikRun];
    } else {
      const initialRun: TestRun = {
        id: 'run-initial-baseline',
        projectId: project.id,
        date: new Date(Date.now() - 3600000).toISOString(),
        status: 'completed',
        screensScanned: 12,
        totalScreensCount: 200,
        criticalCount: 1,
        majorCount: 2,
        minorCount: 2,
        clarityCount: 0,
        durationMs: 6400,
        logs: [
          { timestamp: '11:14:10 AM', level: 'info', message: 'Initialized crawler session successfully.' },
          { timestamp: '11:14:12 AM', level: 'info', message: 'Simulated baseline session active for user admin@acme.com.' },
          { timestamp: '11:14:22 AM', level: 'warn', message: 'Variance detected in margin constraints.' }
        ],
        issues: [
          {
            id: 'iss-initial-1',
            testRunId: 'run-initial-baseline',
            screenId: 'analytics-2',
            screenName: 'Dashboard - Screen 2',
            moduleId: 'analytics',
            moduleName: 'Dashboard & Analytics',
            type: 'visual',
            category: 'typography',
            componentName: '.page-title',
            severity: 'Major',
            elementSelector: '.page-title',
            description: 'Font size and font weight mismatch in header. Title text shrinks from 24px semi-bold to 20px regular, causing layout line wraps.',
            rootCause: 'Header title styles configured differently in Stage vs Prototype.',
            prototypeValue: 'Font-Size: 24px, Font-Weight: 600 (Semibold)',
            stageValue: 'Font-Size: 20px, Font-Weight: 400 (Regular)',
            status: 'pending'
          },
          {
            id: 'iss-initial-2',
            testRunId: 'run-initial-baseline',
            screenId: 'analytics-8',
            screenName: 'Dashboard - Screen 8',
            moduleId: 'analytics',
            moduleName: 'Dashboard & Analytics',
            type: 'visual',
            category: 'layout',
            componentName: '.action-btn-primary',
            severity: 'Minor',
            elementSelector: '.action-btn-primary',
            description: 'Action item button padding and border-radius drift. Button is oversized and uses wrong variables.',
            rootCause: 'Border radius mismatch on primary action buttons.',
            prototypeValue: 'Padding: 8px 16px, Radius: 6px',
            stageValue: 'Padding: 12px 24px, Radius: 12px',
            status: 'pending'
          },
          {
            id: 'iss-initial-3',
            testRunId: 'run-initial-baseline',
            screenId: 'analytics-14',
            screenName: 'Dashboard - Screen 14',
            moduleId: 'analytics',
            moduleName: 'Dashboard & Analytics',
            type: 'visual',
            category: 'color',
            componentName: '.data-grid-container',
            severity: 'Critical',
            elementSelector: '.data-grid-container',
            description: 'Primary visual card contains a bright red border mismatch instead of default grey. Deep shadow differences found.',
            rootCause: 'Stage has layout overrides on data container borders.',
            prototypeValue: 'Border: 1px solid #e5e7eb, Shadow: Light',
            stageValue: 'Border: 2px solid #ef4444, Shadow: High Intensity Red Highlight',
            status: 'pending'
          }
        ]
      };
      baseRunList = [initialRun];
    }

    // Load backend persistent run logs dynamically including custom counts
    fetch(`/api/crawler/test-runs?projectId=${project.id}`)
      .then(res => res.json())
      .then(dbRuns => {
        const merged = Array.isArray(dbRuns) ? [...dbRuns, ...baseRunList] : baseRunList;
        setTestRuns(merged);
        if (merged.length > 0 && merged[0].issues.length > 0) {
          setActiveIssueId(merged[0].issues[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to load backend test runs:', err);
        setTestRuns(baseRunList);
        if (baseRunList.length > 0 && baseRunList[0].issues.length > 0) {
          setActiveIssueId(baseRunList[0].issues[0].id);
        }
      });
  }, [project]);

  // Handle saving project config to back-end
  const handleSaveProject = async (updated: Project) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        alert('Configuration saved successfully. Audit trail recorded.');
      }
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  // Callback when a new simulated crawl completed
  const handleCrawlComplete = (newRun: TestRun) => {
    setTestRuns(prev => [newRun, ...prev]);
    setActiveTab('review');
    
    // Select the first mismatch automatically
    if (newRun.issues.length > 0) {
      setActiveIssueId(newRun.issues[0].id);
    }

    // Capture and post custom audit log to the backend
    fetch('/api/audit/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project?.id,
        action: 'test_run_completed',
        details: `Crawl run completed: scanned ${newRun.screensScanned} screens, found ${newRun.issues.length} discrepancies.`
      })
    }).catch(console.error);
  };

  // Action review sign-off
  const handleReviewIssue = (issueId: string, status: 'approved' | 'dismissed_false_positive' | 'promoted_baseline', notes: string) => {
    setTestRuns(prevRuns => 
      prevRuns.map(run => ({
        ...run,
        issues: run.issues.map(iss => {
          if (iss.id === issueId) {
            return {
              ...iss,
              status,
              notes,
              reviewedBy: 'kanithisathvik2005@gmail.com',
              reviewedAt: new Date().toISOString()
            };
          }
          return iss;
        })
      }))
    );
  };

  // HOP back to visual workspace from history selector
  const handleSelectIssueId = (issueId: string) => {
    setActiveIssueId(issueId);
    setActiveTab('review');
  };

  // Perform binary ZIP generation download using backend S3/Zip flow
  const handleDownloadReport = async (run: TestRun) => {
    try {
      const res = await fetch('/api/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRun: run, project })
      });
      if (!res.ok) throw new Error('ZIP generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qa-visual-regression-report-${run.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download report failed:', err);
      alert('Error exporting ZIP package. Check express server connectivity.');
    }
  };

  if (isPreloading || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg text-slate-400 font-mono text-sm gap-3">
        <RefreshCw className="w-5 h-5 text-brand-accent animate-spin" />
        <span>PRELOADING AUTON_QA_SUITE CORE PLATFORM...</span>
      </div>
    );
  }

  const pendingCount = testRuns.length > 0 
    ? testRuns[0].issues.filter(i => i.status === 'pending').length 
    : 0;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-slate-200 antialiased font-sans" id="app-root">
      {/* Prime Header element */}
      <header className="bg-brand-surface border-b border-brand-border shrink-0 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-brand-accent/20 border border-brand-accent text-brand-accent rounded flex items-center justify-center shadow-lg shadow-brand-accent/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping"></span>
                <h1 className="text-sm font-bold tracking-tight text-white leading-none">AI-STAGE.AUTON</h1>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">PROTOTYPE &harr; STAGE REGRESSION • DEV STACK</p>
            </div>
          </div>

          {/* Work scope switcher dropdown */}
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded border border-brand-border max-w-sm sm:max-w-md">
            <Shield className="w-3.5 h-3.5 text-brand-accent font-bold" />
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold hidden sm:inline">Scope context:</span>
            <select
              id="scope-project-selector"
              value={project.id}
              onChange={(e) => {
                const selected = projectsList.find(p => p.id === e.target.value);
                if (selected) {
                  setProject(selected);
                }
              }}
              className="bg-transparent text-white font-bold text-xs border-none outline-none cursor-pointer focus:ring-0 select-white-arrow shrink-0"
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white font-sans text-xs">
                  {p.name} [{p.organization}]
                </option>
              ))}
            </select>
          </div>

          {/* Quick Stats overview panel */}
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded border border-brand-border">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                CRAWLED BASELINE: {project.id === 'logikintake-tenant' ? '100' : '200'} SCREENS
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono block">TENANT AUTH</span>
              <span className="font-semibold text-white text-xs">{project.organization}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Menu structure in outer borders */}
      <div className="bg-brand-surface/60 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 flex">
          <nav className="flex gap-6 text-xs text-center" aria-label="Global Options">
            <button
              id="tab-review-btn"
              type="button"
              onClick={() => setActiveTab('review')}
              className={`py-4 px-1 font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'review' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Eye className="w-4 h-4 text-slate-400" /> 
              Human-in-Loop Review
              {pendingCount > 0 && (
                <span className="bg-brand-danger text-white font-bold px-1.5 py-0.5 rounded text-[9px] font-mono leading-none">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              id="tab-crawler-btn"
              type="button"
              onClick={() => setActiveTab('crawler')}
              className={`py-4 px-1 font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'crawler' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Activity className="w-4 h-4 text-slate-400" /> Autonomous Crawler Console
            </button>
            <button
              id="tab-blueprint-btn"
              type="button"
              onClick={() => setActiveTab('blueprint')}
              className={`py-4 px-1 font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'blueprint' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Cpu className="w-4 h-4 text-brand-accent animate-pulse" /> QA OS Architecture
            </button>
            <button
              id="tab-history-btn"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'history' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <History className="w-4 h-4 text-slate-400" /> Platform Sign-offs & Audit
            </button>
            <button
              id="tab-config-btn"
              type="button"
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'config' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Settings className="w-4 h-4 text-slate-400" /> Tenant Configurations
            </button>
          </nav>
        </div>
      </div>

      {/* Primary content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8" id="main-content">
        {activeTab === 'review' && (
          <SnoopCompareWorkspace
            project={project}
            testRuns={testRuns}
            onReviewIssue={handleReviewIssue}
            activeIssueId={activeIssueId}
          />
        )}

        {activeTab === 'crawler' && (
          <LiveCrawlerConsole
            project={project}
            onCrawlComplete={handleCrawlComplete}
            activeRun={null}
            setActiveRun={() => {}}
          />
        )}

        {activeTab === 'blueprint' && (
          <OSArchitecturePanel />
        )}

        {activeTab === 'history' && (
          <AuditHistoryPanel
            project={project}
            testRuns={testRuns}
            onSelectIssue={handleSelectIssueId}
            onDownloadReport={handleDownloadReport}
          />
        )}

        {activeTab === 'config' && (
          <ConfigPanel
            project={project}
            onSave={handleSaveProject}
          />
        )}
      </main>

      {/* Understated elegant footer accent */}
      <footer className="bg-brand-surface border-t border-brand-border py-4 text-center shrink-0">
        <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
          AI Standard QA System &bull; REGRESSION WORKSPACE T-293-PROD-AUTH &bull; v2.8.0-enterprise
        </p>
      </footer>
    </div>
  );
}
