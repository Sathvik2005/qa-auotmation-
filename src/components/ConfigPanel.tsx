import React, { useState } from 'react';
import { Project, Credentials } from '../types';
import { Save, Plus, Trash2, Key, Info, Settings, Clock, Link as LinkIcon, RefreshCw, Sliders } from 'lucide-react';

interface ConfigPanelProps {
  project: Project;
  onSave: (updated: Project) => void;
}

export default function ConfigPanel({ project, onSave }: ConfigPanelProps) {
  const [formData, setFormData] = useState<Project>({ ...project });
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const [newMask, setNewMask] = useState('');
  const [newBlacklist, setNewBlacklist] = useState('');

  const handleAddField = <K extends keyof Project>(field: K, val: string) => {
    if (!val.trim()) return;
    const array = (formData[field] as string[]) || [];
    if (!array.includes(val.trim())) {
      setFormData({
        ...formData,
        [field]: [...array, val.trim()]
      });
    }
  };

  const handleRemoveField = <K extends keyof Project>(field: K, index: number) => {
    const array = (formData[field] as string[]) || [];
    const updated = [...array];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      [field]: updated
    });
  };

  const addCreds = () => {
    if (!newRole.trim() || !newUser.trim()) return;
    const newCred: Credentials = {
      id: `cred-${Date.now()}`,
      role: newRole,
      username: newUser,
      description: newDesc
    };
    setFormData({
      ...formData,
      credentials: [...formData.credentials, newCred]
    });
    setNewRole('');
    setNewUser('');
    setNewDesc('');
  };

  const removeCreds = (id: string) => {
    setFormData({
      ...formData,
      credentials: formData.credentials.filter(c => c.id !== id)
    });
  };

  return (
    <div className="space-y-6" id="config-panel">
      {/* Basic Setup Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-surface p-6 rounded border border-brand-border shadow-xs">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-accent animate-pulse" /> GENERAL CONTEXT OVERVIEW
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">PROJECT IDENTIFIER</label>
              <input
                id="cfg-input-name"
                type="text"
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-white placeholder-slate-600 focus:border-brand-accent/50 focus:outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">TENANT ORGANIZATION</label>
              <input
                id="cfg-input-org"
                type="text"
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-white placeholder-slate-600 focus:border-brand-accent/50 focus:outline-none transition"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-brand-accent" /> ENVIRONMENT HOST ROUTINGS
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">PROTOTYPE DEPLOYMENT (CANDIDATE BUILD SOURCE)</label>
              <input
                id="cfg-input-proto"
                type="url"
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-brand-accent placeholder-slate-605 focus:border-brand-accent/50 focus:outline-none transition font-mono"
                value={formData.prototypeUrl}
                onChange={(e) => setFormData({ ...formData, prototypeUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">STAGE ENVIRONMENT (CURRENT LIVE BASELINE)</label>
              <input
                id="cfg-input-stage"
                type="url"
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-brand-warning placeholder-slate-605 focus:border-brand-accent/50 focus:outline-none transition font-mono"
                value={formData.stageUrl}
                onChange={(e) => setFormData({ ...formData, stageUrl: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Area */}
      <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-accent" /> MULTI-TENANT IDENTITY TOKEN STORE
        </h3>
        <p className="text-[11px] text-slate-400">
          Set role-based automated login profiles. During recursive browser walks, crawler engines simulate token swaps of selected profiles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-black/20 p-4 rounded border border-brand-border">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">ROLE SCHEMATIC</label>
            <input
              id="cfg-cred-role"
              type="text"
              placeholder="e.g. Finance Admin"
              className="w-full text-xs px-2.5 py-1.5 border border-brand-border bg-black/40 text-slate-200 rounded focus:border-brand-accent/50 focus:outline-none"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">PORTAL USERNAME</label>
            <input
              id="cfg-cred-user"
              type="text"
              placeholder="user@tenant.com"
              className="w-full text-xs px-2.5 py-1.5 border border-brand-border bg-black/40 text-slate-200 rounded focus:border-brand-accent/50 focus:outline-none"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <div className="grow">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider">SESSION DESCRIPTIVE RANGE</label>
              <input
                id="cfg-cred-desc"
                type="text"
                placeholder="Limits navigation routes to specific finance tabs"
                className="w-full text-xs px-2.5 py-1.5 border border-brand-border bg-black/40 text-slate-200 rounded focus:border-brand-accent/50 focus:outline-none"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <button
              id="cfg-add-cred-btn"
              type="button"
              onClick={addCreds}
              className="px-3.5 py-1.5 bg-brand-accent hover:bg-blue-600 text-white font-bold rounded uppercase text-[10px] tracking-wider flex items-center gap-1 shrink-0 h-8 self-end transition shadow-lg shadow-brand-accent/25 border border-brand-accent/20"
            >
              <Plus className="w-3.5 h-3.5" /> ADD LOGIN
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 font-bold uppercase tracking-wider font-mono">
                <th className="py-2.5">ROLE TYPE</th>
                <th className="py-2.5">AUTHENTICATION USER PROTOCOL</th>
                <th className="py-2.5">TASK SCOPE ORIENTATION</th>
                <th className="py-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {formData.credentials.map((cred) => (
                <tr key={cred.id} className="border-b border-brand-border/60 hover:bg-black/30 transition">
                  <td className="py-2.5 text-slate-200 font-bold">{cred.role}</td>
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">{cred.username}</td>
                  <td className="py-2.5 text-slate-400 font-sans">{cred.description}</td>
                  <td className="py-2.5 text-right">
                    <button
                      id={`remove-cred-${cred.id}`}
                      type="button"
                      onClick={() => removeCreds(cred.id)}
                      className="text-brand-danger hover:text-red-500 font-bold transition px-1.5"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crawling Logic and Live Masking rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Data Masking Rules */}
        <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-warning animate-pulse" /> VOLATILE RENDERING MASK SELECTORS
          </h3>
          <p className="text-[11px] text-slate-400">
            Define layout CSS Selectors to <strong>mask (alpha-0)</strong> during checks. Prevents false regression alerts on transient variables like timestamps, randomized table keys, or status signals.
          </p>

          <div className="flex gap-2">
            <input
              id="cfg-input-mask-selector"
              type="text"
              placeholder="e.g. .chart-timestamp or .current-user-token"
              value={newMask}
              onChange={(e) => setNewMask(e.target.value)}
              className="grow text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-slate-350 focus:border-brand-accent/50 focus:outline-none transition font-mono"
            />
            <button
              id="cfg-add-mask-btn"
              type="button"
              onClick={() => { handleAddField('maskingRules', newMask); setNewMask(''); }}
              className="px-3.5 py-2 bg-black/60 hover:bg-black/80 text-slate-200 border border-brand-border rounded uppercase font-bold text-[10px] tracking-wider transition shrink-0"
            >
              Add Rule
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {formData.maskingRules?.map((rule, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-warning/10 text-brand-warning border border-brand-warning/30 rounded text-[11px] font-mono">
                {rule}
                <button
                  id={`remove-mask-${idx}`}
                  type="button"
                  onClick={() => handleRemoveField('maskingRules', idx)}
                  className="hover:text-red-400 font-bold font-mono shrink-0 ml-1 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Blacklists & Exclusions */}
        <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-brand-danger" /> RECURSIVE DISCOVERY BLACKLISTS
          </h3>
          <p className="text-[11px] text-slate-400">
            Specify page directories or regex wildcards that the crawler should skip. Useful for blocking stripe gateways, logout endpoints, or tracking analytics setups.
          </p>

          <div className="flex gap-2">
            <input
              id="cfg-input-blacklist"
              type="text"
              placeholder="e.g. /billing/checkout-final or /api/*"
              value={newBlacklist}
              onChange={(e) => setNewBlacklist(e.target.value)}
              className="grow text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-slate-350 focus:border-brand-accent/50 focus:outline-none transition font-mono"
            />
            <button
              id="cfg-add-blacklist-btn"
              type="button"
              onClick={() => { handleAddField('blacklistRoutes', newBlacklist); setNewBlacklist(''); }}
              className="px-3.5 py-2 bg-black/60 hover:bg-black/80 text-slate-200 border border-brand-border rounded uppercase font-bold text-[10px] tracking-wider transition shrink-0"
            >
              Add Route
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {formData.blacklistRoutes?.map((route, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 bg-brand-danger/10 text-brand-danger border border-brand-danger/30 rounded text-[11px] font-mono">
                {route}
                <button
                  id={`remove-blacklist-${idx}`}
                  type="button"
                  onClick={() => handleRemoveField('blacklistRoutes', idx)}
                  className="hover:text-red-400 font-bold font-mono shrink-0 ml-1 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Stabilization & Engine Determinism */}
      <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs space-y-6">
        <div className="border-b border-brand-border pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-accent animate-pulse" /> ENTERPRISE ENGINE DETERMINISM & RELIABILITY rules
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Configure autonomous browser crawler regulations and stabilization routines to guarantee zero hallucination regression outputs.
            </p>
          </div>
          <span className="text-[9px] bg-brand-accent/20 border border-brand-accent/40 text-brand-accent font-mono font-bold px-2 py-0.5 rounded leading-none">
            DETERMINISTIC AUTO-RUNS ACTIVATIVE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Numerical bounds */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 tracking-wider uppercase">CRAWL STABILIZATION WAIT DELAY</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  value={formData.crawlStabilizationWaitMs || 450}
                  onChange={(e) => setFormData({ ...formData, crawlStabilizationWaitMs: parseInt(e.target.value) })}
                />
                <span className="text-xs font-mono font-bold text-brand-warning w-16 shrink-0 text-right">
                  {formData.crawlStabilizationWaitMs || 450} ms
                </span>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 block leading-relaxed">
                Wait network idle, animation transitions, spinners, skeleton loader disappearance, and scroll stabilization before screen grabbing.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 tracking-wider uppercase">MATCH RETRY FAIL LIMIT</label>
              <select
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/40 text-slate-200 outline-none focus:border-brand-accent/50 transition font-sans"
                value={formData.retryAttempts || 3}
                onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) })}
              >
                <option value="1">1 Attempt (Strict immediate fail)</option>
                <option value="2">2 Attempts (Standard retry failover)</option>
                <option value="3">3 Attempts (Enterprise default)</option>
                <option value="5">5 Attempts (Network intensive)</option>
              </select>
              <span className="text-[9px] text-slate-500 mt-1 block leading-relaxed">
                Retry unstable pages up to N times under active sandbox session preservation before categorization as "Clarity Needed".
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 tracking-wider uppercase">SCREENSHOT DIFF THRESHOLD</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.01"
                  max="0.20"
                  step="0.01"
                  className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                  value={formData.screenshotDiffThresholdPercent || 0.05}
                  onChange={(e) => setFormData({ ...formData, screenshotDiffThresholdPercent: parseFloat(e.target.value) })}
                />
                <span className="text-xs font-mono font-bold text-brand-accent w-16 shrink-0 text-right">
                  {((formData.screenshotDiffThresholdPercent || 0.05) * 100).toFixed(0)}%
                </span>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 block leading-relaxed">
                The pixel variance coefficient threshold level below which difference triggers are safely suppressed (screenshot quality standard).
              </span>
            </div>
          </div>

          {/* Column 2: Specific Core Rules of Determinism */}
          <div className="space-y-4 bg-black/15 p-4 rounded border border-brand-border">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest border-b border-brand-border/40 pb-1 mb-2">
              DETERMINISTIC REGULATORY SWITCHES
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!formData.enableAntiHallucination}
                onChange={(e) => setFormData({ ...formData, enableAntiHallucination: e.target.checked })}
                className="rounded border-brand-border bg-black text-brand-accent mt-0.5 focus:ring-0 w-3.5 h-3.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Anti-Hallucination Guardrails</span>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-relaxed">
                  Suppress temporary rendering flickers, partial text loads, or incorrect prototype expectation.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!formData.enableLiveDataIgnoreSelector}
                onChange={(e) => setFormData({ ...formData, enableLiveDataIgnoreSelector: e.target.checked })}
                className="rounded border-brand-border bg-black text-brand-accent mt-0.5 focus:ring-0 w-3.5 h-3.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Live Data Normalization Engine</span>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-relaxed">
                  Avoid regression failures caused solely by active timestamps, counters, usernames and live stats.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!formData.enableInteractionReplayLogging}
                onChange={(e) => setFormData({ ...formData, enableInteractionReplayLogging: e.target.checked })}
                className="rounded border-brand-border bg-black text-brand-accent mt-0.5 focus:ring-0 w-3.5 h-3.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Interaction Replay Log Store</span>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-relaxed">
                  Chronicle active clicking paths, click coordinates & trigger state handshakes during autonomous testing.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!formData.enableSessionRecovery}
                onChange={(e) => setFormData({ ...formData, enableSessionRecovery: e.target.checked })}
                className="rounded border-brand-border bg-black text-brand-accent mt-0.5 focus:ring-0 w-3.5 h-3.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Instant Session Failover Recovery</span>
                <span className="text-[9px] text-slate-500 block mt-0.5 leading-relaxed">
                  Restore active token cookies during page load fails, saving test runs from total crash failures.
                </span>
              </div>
            </label>
          </div>

          {/* Column 3: Route Whitelists & Sign-offs flow */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">ACTIVE ROUTE WHITELIST REGEX</label>
              <input
                type="text"
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/30 text-slate-200 placeholder-slate-600 focus:border-brand-accent/50 focus:outline-none transition font-mono"
                placeholder="e.g. ^\/platform\/admin\/.*"
                value={formData.whitelistRoutesRegex || ''}
                onChange={(e) => setFormData({ ...formData, whitelistRoutesRegex: e.target.value })}
              />
              <span className="text-[9px] text-slate-500 mt-1 block leading-relaxed">
                Deterministic rule restricts visual scans solely to routes matching this Regular Expression validation regex context.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">BASELINE PROMOTION WORKFLOW</label>
              <select
                className="w-full text-xs px-3 py-2 border border-brand-border rounded bg-black/40 text-slate-200 outline-none focus:border-brand-accent/50 transition font-sans text-xs"
                value={formData.baselineApprovalMode || 'requires_reviewer'}
                onChange={(e) => setFormData({ ...formData, baselineApprovalMode: e.target.value as any })}
              >
                <option value="instant">Instant Automated Baseline Update (Devel Fast)</option>
                <option value="requires_reviewer">Requires Auditor Sign-off Approval (Standard)</option>
                <option value="requires_double_reviewer">Requires Double-Auditor Dual Signature (Hardened)</option>
              </select>
              <span className="text-[9px] text-slate-500 mt-1 block leading-relaxed">
                Mandate promotion protocol logic before elevating a visual stage discrepancy snapshot into a permanent baseline rule database.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution automation schedules */}
      <div className="bg-brand-surface p-6 rounded border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-success animate-pulse" /> CRON AUTOMATED COMPOSITE SCHEDULER
          </h3>
          <p className="text-[11px] text-slate-400">
            Automatically trigger deep comparison regression runs. Seamlessly delivers alert updates to team Webhooks.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              id="cfg-input-cron"
              type="text"
              className="text-xs px-3 py-1.5 border border-brand-border rounded bg-black/40 text-slate-200 font-mono w-40 focus:border-brand-accent/50 focus:outline-none"
              value={formData.scheduleCron || '0 0 * * *'}
              onChange={(e) => setFormData({ ...formData, scheduleCron: e.target.value })}
            />
            <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wide">Cron syntax format (Min Hour Day Month Year)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="cfg-toggle-schedule"
              type="checkbox"
              className="sr-only peer"
              checked={formData.scheduleEnabled}
              onChange={(e) => setFormData({ ...formData, scheduleEnabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-black/40 border border-brand-border rounded-full peer peer-focus:ring-0 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent peer-checked:after:translate-x-full peer-checked:after:bg-white"></div>
            <span className="ml-2.5 text-[10px] font-bold tracking-wider text-slate-300 uppercase">ENABLE RUNS</span>
          </label>

          <button
            id="cfg-save-all-btn"
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2.5 bg-brand-accent hover:bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-accent/25 border border-brand-accent/20 transition animate-pulse"
          >
            <Save className="w-4 h-4" /> Save Suite Config
          </button>
        </div>
      </div>
    </div>
  );
}
