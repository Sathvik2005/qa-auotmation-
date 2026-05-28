import React, { useState, useEffect } from 'react';
import { TestRun, AuditRecord, Project } from '../types';
import { Calendar, Clock, BarChart3, AlertOctagon, CheckSquare, ChevronRight, Activity, ShieldCheck, Download, Trash2, Heart, FileText, Printer, X } from 'lucide-react';

interface AuditHistoryPanelProps {
  project: Project;
  testRuns: TestRun[];
  onSelectIssue: (issueId: string) => void;
  onDownloadReport: (run: TestRun) => void;
}

export default function AuditHistoryPanel({ project, testRuns, onSelectIssue, onDownloadReport }: AuditHistoryPanelProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch audit records from backend API
  useEffect(() => {
    fetch('/api/audit')
      .then(res => res.json())
      .then(data => setAudits(data))
      .catch(console.error);

    if (testRuns.length > 0) {
      setSelectedRunId(testRuns[0].id);
    }
  }, [testRuns]);

  const selectedRun = testRuns.find(r => r.id === selectedRunId) || testRuns[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="audit-history">
      {/* Test Runs list (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-brand-surface p-5 rounded border border-brand-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-accent" /> Regression Session Ledger
          </h3>
          <p className="text-[11px] text-slate-400">
            Select a completed automated session to inspect metrics and sign-off statuses.
          </p>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scroll-hide">
            {testRuns.length === 0 ? (
              <span className="text-xs text-slate-500 italic block py-4 text-center">No runs recorded yet.</span>
            ) : (
              testRuns.map((run) => {
                const isActive = selectedRunId === run.id;
                const dateObj = new Date(run.date);
                const isManual = run.id.includes('manual') || run.id.includes('initial');

                return (
                  <div
                     key={run.id}
                     onClick={() => setSelectedRunId(run.id)}
                     className={`p-3.5 rounded border text-left cursor-pointer transition ${isActive ? 'border-brand-accent bg-brand-accent/11 shadow-lg shadow-brand-accent/5' : 'border-brand-border/60 hover:bg-brand-surface hover:border-brand-border'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {isManual ? 'Manual Prototype Crawl' : 'Automated Baseline Run'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {run.screensScanned} SCREENS
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-brand-accent" />
                      <span>{dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}</span>
                      <span>&bull;</span>
                      <Clock className="w-3 h-3 text-brand-accent" />
                      <span>{((run.durationMs || 1000) / 1000).toFixed(1)}S</span>
                    </div>

                    {/* Counts overview badges */}
                    <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-brand-border/60 justify-between">
                      <div className="flex gap-2">
                        {run.criticalCount > 0 && (
                          <span className="bg-brand-danger/10 text-brand-danger font-bold px-1.5 py-0.5 rounded text-[9px] font-mono border border-brand-danger/30">
                            {run.criticalCount} CRT
                          </span>
                        )}
                        {run.majorCount > 0 && (
                          <span className="bg-brand-warning/10 text-brand-warning font-bold px-1.5 py-0.5 rounded text-[9px] font-mono border border-brand-warning/30">
                            {run.majorCount} MJR
                          </span>
                        )}
                        {run.minorCount > 0 && (
                          <span className="bg-brand-accent/10 text-brand-accent font-bold px-1.5 py-0.5 rounded text-[9px] font-mono border border-brand-accent/30">
                            {run.minorCount} MNR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider font-mono">
                        {run.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Audit Signature Trail (GCP Organization like logs) */}
        <div className="bg-brand-surface p-5 rounded border border-brand-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-success" /> PLATFORM CHANGE JOURNAL
          </h3>
          <p className="text-[11px] text-slate-400">
            System records of baseline updates, environment configuration offsets, and feedback loops.
          </p>

          <div className="space-y-4 max-h-[220px] overflow-y-auto border-l-2 border-slate-800 pl-4 py-1 text-[11px] scroll-hide">
            {audits.map((aud) => (
              <div key={aud.id} className="relative space-y-1">
                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-brand-success ring-4 ring-brand-surface"></span>
                <div className="flex items-center justify-between text-slate-500 text-[9px] font-mono font-bold">
                  <span>ID: {aud.user.toUpperCase()}</span>
                  <span>{new Date(aud.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 font-medium leading-normal">{aud.details}</p>
                <div className="inline-block bg-black/40 text-brand-accent border border-brand-border/60 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
                  {aud.action.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Run overview + Action elements (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {selectedRun ? (
          <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
              <div>
                <span className="text-[9px] font-bold text-brand-accent bg-brand-accent/15 border border-brand-accent/25 px-2 py-0.5 rounded font-mono uppercase tracking-wide">SESSION TELEMETRY ANALYZED</span>
                <h4 className="text-base font-bold text-white mt-2">Executive Drift Sign-off Report</h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-generate-pdf-report"
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3 py-2 bg-black/60 border border-brand-border hover:bg-black/80 text-slate-200 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-brand-success" /> Generate PDF Audit
                </button>
                <button
                  id="btn-download-run-report"
                  type="button"
                  onClick={() => onDownloadReport(selectedRun)}
                  className="px-3 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-brand-accent/20 border border-brand-accent/30 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download ZIP
                </button>
              </div>
            </div>

            {/* Counts metrics board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded border border-brand-border">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Run STATUS</span>
                <span className="text-base font-bold text-white block mt-1 font-mono">COMPLETE</span>
              </div>
              <div className="bg-black/30 p-4 rounded border border-brand-border">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Verified Units</span>
                <span className="text-base font-bold text-slate-250 block mt-1 font-mono">{selectedRun.screensScanned} / {selectedRun.totalScreensCount}</span>
              </div>
              <div className="bg-black/30 p-4 rounded border border-brand-border">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status Safe</span>
                <span className="text-base font-bold text-brand-success block mt-1 font-mono">{selectedRun.screensScanned - selectedRun.issues.length}</span>
              </div>
              <div className="bg-black/30 p-4 rounded border border-brand-border">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Identified Drifts</span>
                <span className="text-base font-bold text-brand-danger block mt-1 font-mono">{selectedRun.issues.length}</span>
              </div>
            </div>

            {/* Discovered anomalies lists */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Discovered UI & Logic Mutations ({selectedRun.issues.length})</h5>
              <div className="divide-y divide-brand-border border border-brand-border rounded overflow-hidden bg-black/15">
                {selectedRun.issues.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic font-sans">
                    System OK: Zero pixel mismatches or interactive discrepancies registered in this audit file.
                  </div>
                ) : (
                  selectedRun.issues.map((iss) => (
                    <div key={iss.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-900/45 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-sans">{iss.screenName}</span>
                          <span className="text-[9px] font-mono bg-slate-800 text-brand-accent px-1.5 py-0.5 rounded font-bold uppercase border border-brand-border/60">{iss.category}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">{iss.description}</p>
                        <div className="text-[9px] text-slate-500 font-mono">DOM Selector: <span className="text-brand-warning">{iss.elementSelector}</span></div>
                      </div>

                      <button
                        id={`btn-hop-issue-${iss.id}`}
                        type="button"
                        onClick={() => onSelectIssue(iss.id ?? '')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-brand-accent/20 hover:text-white hover:border-brand-accent text-slate-300 font-bold border border-brand-border rounded uppercase text-[9px] tracking-wider shrink-0 transition flex items-center gap-1 cursor-pointer"
                      >
                        Compare <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-brand-surface p-12 text-center rounded border border-brand-border h-[480px] flex flex-col items-center justify-center">
            <CheckSquare className="w-12 h-12 text-slate-500 mb-2 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase">Audit Ledger Empty</h3>
            <p className="text-xs text-slate-400 mt-1.5">Execute design checks to list transaction and evaluation profiles.</p>
          </div>
        )}
      </div>

      {isPrintModalOpen && selectedRun && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col justify-start overflow-y-auto" id="pdf-report-preview-modal">
          {/* Top Control Bar in Elegant Matte Black */}
          <div className="bg-[#0f131a] border-b border-brand-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-success" />
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">COMPLIANCE REPORT GENERATOR</h3>
                <p className="text-[10px] text-slate-400 font-mono">AUTON COMPILER v1.8 &bull; SECURE LOCAL SIGN-OFF</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-brand-success hover:bg-emerald-600 text-white font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-brand-border rounded text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" /> Close Preview
              </button>
            </div>
          </div>

          {/* Styled Print Sheet workspace container */}
          <div className="flex-1 p-6 md:p-12 bg-slate-950/40">
            <div 
              id="printable-report-content" 
              className="bg-white text-slate-900 p-8 md:p-12 max-w-4xl mx-auto rounded shadow-2xl font-sans border border-slate-300 relative print:shadow-none print:border-none print:p-0 print:my-0 text-left"
            >
              {/* Inject CSS rule overrides scoped only when printing */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body { background: white !important; color: black !important; }
                  body * { visibility: hidden !important; }
                  #printable-report-content, #printable-report-content * { visibility: visible !important; }
                  #printable-report-content { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
                  .print\\:hidden { display: none !important; }
                }
              `}} />

              {/* Document Header Accent */}
              <div className="border-b-4 border-slate-800 pb-5 mb-6 flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3B82F6] mb-1">
                    AI-STAGE Visual Engineering
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Visual Mismatch Sign-Off Report
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Automated client-side regression audit documentation &amp; verification file.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-100 text-slate-800 text-[10px] font-bold font-mono px-2.5 py-1 rounded uppercase border border-slate-300">
                    Audit Token Active
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1.5">
                    SEC_CODE_72A
                  </div>
                </div>
              </div>

              {/* Executive Metadata Block */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded p-4 mb-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Project Environment</span>
                  <strong className="text-slate-800 font-bold block mt-0.5">{project.name}</strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{project.organization}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Audit Release Signature</span>
                  <strong className="text-slate-800 font-bold block mt-0.5">kanithisathvik2005@gmail.com</strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Primary QA Lead Inspector</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[9px] block">Verification Date &amp; Run</span>
                  <strong className="text-slate-800 font-semibold block mt-0.5 font-mono text-[11px] uppercase">
                    {new Date(selectedRun.date).toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono text-[9px]">ID: {selectedRun.id}</span>
                </div>
              </div>

              {/* Statistical Summary section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  Executive Metrics Overview
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border border-slate-200 rounded p-3 text-center bg-slate-10/10">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Scanned Mapped</span>
                    <span className="text-md font-bold font-mono text-slate-800 mt-0.5 block">{selectedRun.screensScanned}</span>
                  </div>
                  <div className="border border-slate-200 rounded p-3 text-center bg-emerald-50/20 border-emerald-100">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Baseline Match</span>
                    <span className="text-md font-bold font-mono text-emerald-700 mt-0.5 block">
                      {selectedRun.screensScanned - selectedRun.issues.length}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded p-3 text-center bg-rose-50/20 border-rose-100">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Active Drifts</span>
                    <span className="text-md font-bold font-mono text-rose-700 mt-0.5 block">{selectedRun.issues.length}</span>
                  </div>
                  <div className="border border-slate-200 rounded p-3 text-center bg-slate-10/10">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">Session Duration</span>
                    <span className="text-md font-bold font-mono text-slate-800 mt-0.5 block">
                      {((selectedRun.durationMs || 1000) / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Findings Inconsistency List */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                  Detailed Findings &amp; Visual Anomalies List
                </h3>
                <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-200 text-xs text-left">
                  {selectedRun.issues.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic">
                      Zero interface mismatches detected. Verification suite checked completely aligned with the baseline.
                    </div>
                  ) : (
                    selectedRun.issues.map((iss, i) => {
                      let sevStyle = "bg-slate-100 text-slate-700 border-slate-300";
                      if (iss.severity === 'Critical') sevStyle = "bg-red-50 text-red-800 border-red-200";
                      else if (iss.severity === 'Major') sevStyle = "bg-amber-50 text-amber-800 border-amber-200";
                      else if (iss.severity === 'Minor') sevStyle = "bg-blue-50 text-blue-800 border-blue-200";

                      return (
                        <div key={iss.id} className="p-4 space-y-2 bg-white hover:bg-slate-5/20 transition">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-slate-800 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                {i + 1}
                              </span>
                              <strong className="text-xs font-bold text-slate-900 font-sans">{iss.screenName}</strong>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase">
                              <span className={`px-2 py-0.5 font-bold rounded border uppercase ${sevStyle}`}>
                                {iss.severity}
                              </span>
                              <span className="px-1.5 py-0.5 bg-slate-105 border border-slate-200 text-slate-600 rounded">
                                {iss.category}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            <strong>Observed difference:</strong> {iss.description}
                          </p>

                          {/* Technical Grid of attributes */}
                          <div className="bg-slate-50 rounded border border-slate-200 p-2.5 font-mono text-[9px] text-slate-700 space-y-1">
                            <div><span className="text-slate-400 font-semibold uppercase">Target Node Selector:</span> <span className="text-slate-900 font-medium">{iss.elementSelector}</span></div>
                            <div className="pt-1.5 border-t border-dashed border-slate-250 mt-1 flex justify-between gap-4">
                              <div className="flex-1"><span className="text-slate-400 font-semibold uppercase block">Prototype Spec Value</span> <span className="text-blue-600 font-semibold">{iss.prototypeValue || "N/A"}</span></div>
                              <div className="flex-1 border-l border-slate-200 pl-4"><span className="text-slate-400 font-semibold uppercase block">Stage Value Candidate</span> <span className="text-rose-600 font-semibold">{iss.stageValue || "N/A"}</span></div>
                            </div>
                            {iss.rootCause && (
                              <div className="pt-1.5 border-t border-dashed border-slate-200 mt-1"><span className="text-slate-400 font-semibold uppercase">Primary Root Cause:</span> <span className="text-slate-800">{iss.rootCause}</span></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Signature Card Releases */}
              <div className="border-t border-slate-200 pt-6 mt-8">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono text-center">
                  Inspection Sign-off &amp; Compliance Signatures
                </h4>
                <div className="grid grid-cols-3 gap-6 text-center text-xs">
                  <div className="space-y-3">
                    <div className="h-8 border-b border-dashed border-slate-300 flex items-end justify-center font-serif italic text-slate-800 pb-0.5">
                      kanithisathvik2005
                    </div>
                    <div>
                      <strong className="text-slate-800 block font-semibold text-[10px]">QA Lead Reviewer</strong>
                      <span className="text-[9px] text-slate-450 block">kanithisathvik2005@gmail.com</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 border-b border-dashed border-slate-300"></div>
                    <div>
                      <strong className="text-slate-800 block font-semibold text-[10px]">Head of Visual QA</strong>
                      <span className="text-[9px] text-slate-450 block">Branding Strategy Sign</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 border-b border-dashed border-slate-300 flex items-end justify-center font-mono text-[9px] text-emerald-600 font-bold pb-0.5">
                      VERIFIED BY SYSTEM
                    </div>
                    <div>
                      <strong className="text-slate-800 block font-semibold text-[10px]">DevOps Sign-off</strong>
                      <span className="text-[9px] text-slate-450 block">Continuous Integration Suite</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printable system footer */}
              <div className="text-center font-mono text-[8px] text-slate-400 mt-10 border-t border-slate-100 pt-2">
                Secure executive summary document generated by AI-STAGE.AUTON on May 28, 2026. File ID: audit-{selectedRun.id}. All rights reserved under local compliance regulations.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
