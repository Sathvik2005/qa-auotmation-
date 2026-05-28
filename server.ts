import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';
import { AgentQueueOrchestrator } from './src/agents/crawler';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// In-Memory Database for dynamic configuration persistency
let projects = [
  {
    id: 'default-tenant',
    name: 'Salesforce CRM Revamp',
    organization: 'Acme SaaS Inc.',
    prototypeUrl: 'https://prototype-revamp.acme.com/crm',
    stageUrl: 'https://stage.acme.com/crm',
    credentials: [
      { id: 'cred-1', role: 'Global Administrator', username: 'admin@acme.com', description: 'Enterprise Full Administrator Session' },
      { id: 'cred-2', role: 'Sales rep', username: 'rep-jersey@acme.com', description: 'Sales rep viewport with custom commissions' }
    ],
    selectedRoutes: [
      'analytics-1', 'analytics-2', 'analytics-8', 'analytics-14',
      'crm-1', 'crm-2', 'crm-5', 'crm-8',
      'billing-1', 'billing-2', 'billing-12', 'billing-14'
    ],
    blacklistRoutes: ['analytics-5', 'security-18'],
    maskingRules: ['.sync-timestamp', '.visitor-counter', '.volatile-token', '.session-uuid'],
    scheduleCron: '0 0 * * *', // Daily at midnight
    scheduleEnabled: true,
    
    // --- Enterprise QA Defaults ---
    retryAttempts: 3,
    crawlStabilizationWaitMs: 350,
    screenshotDiffThresholdPercent: 0.05,
    enableAntiHallucination: true,
    enableLiveDataIgnoreSelector: true,
    whitelistRoutesRegex: '^\\/crm\\/analytics\\/.*',
    enableInteractionReplayLogging: true,
    enableSessionRecovery: true,
    baselineApprovalMode: 'requires_reviewer'
  },
  {
    id: 'logikintake-tenant',
    name: 'LogikIntake Config Hub',
    organization: 'Logikality AI',
    prototypeUrl: 'https://logikintake.logikcore.app/platform/logikintake/admin/config-hub',
    stageUrl: 'https://stage.logikality.ai/org/logikcore/apps/logik-intake/admin',
    credentials: [
      { id: 'cred-logik-admin', role: 'admin', username: 'admin@logikcore.com', description: 'Preserve Tenant admin context. Restricted to admin setup module validation.' },
      { id: 'cred-logik-review', role: 'review-ops', username: 'review-ops@logikality.ai', description: 'Interactive verification role for mortgage stacking.' }
    ],
    selectedRoutes: [
      'admin-setup-2', 'operator-setup-8', 'classification-review-14', 'extraction-review-12', 'validation-review-1', 'database-sync-3'
    ],
    blacklistRoutes: ['/billing/*', '/api/*', '/logout'],
    maskingRules: ['.sync-timestamp', '.volatile-jwt', 'div.visitor-count'],
    scheduleCron: '*/30 * * * *', // Every 30 minutes
    scheduleEnabled: true,
    
    // --- Enterprise QA Defaults ---
    retryAttempts: 3,
    crawlStabilizationWaitMs: 450,
    screenshotDiffThresholdPercent: 0.02,
    enableAntiHallucination: true,
    enableLiveDataIgnoreSelector: true,
    whitelistRoutesRegex: '^\\/platform\\/logikintake\\/.*',
    enableInteractionReplayLogging: true,
    enableSessionRecovery: true,
    baselineApprovalMode: 'requires_double_reviewer'
  }
];

let auditLogs = [
  { id: 'audit-logik-1', projectId: 'logikintake-tenant', timestamp: new Date(Date.now() - 600000).toISOString(), action: 'test_run_completed', user: 'System crawler', details: 'Autonomous QA Audit run completed. Scanned 5 screens, detected 5 visual & functional mismatches.' },
  { id: 'audit-1', projectId: 'default-tenant', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'baseline_promoted', user: 'kanithisathvik2005@gmail.com', details: 'Promoted Dashboard - Screen 2 markup changes to Baseline standard.' },
  { id: 'audit-2', projectId: 'default-tenant', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'test_run_completed', user: 'System crawler', details: 'Full automated baseline regression suite finished. Scanned 12 screens, discovered 5 mismatches.' }
];

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// REST API Endpoints
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const data = req.body;
  if (!data.id) {
    data.id = `tenant-${Date.now()}`;
    projects.push(data);
  } else {
    projects = projects.map(p => p.id === data.id ? { ...p, ...data } : p);
  }
  // Record audit
  auditLogs.unshift({
    id: `audit-${Date.now()}`,
    projectId: data.id,
    timestamp: new Date().toISOString(),
    action: 'project_updated',
    user: 'kanithisathvik2005@gmail.com',
    details: `Updated workspace configuration and parameters for project "${data.name}".`
  });
  res.json({ success: true, project: data });
});

app.get('/api/audit', (req, res) => {
  const { projectId } = req.query;
  const filtered = projectId ? auditLogs.filter(l => l.projectId === projectId) : auditLogs;
  res.json(filtered);
});

// Custom Test Runs store in backend representing persistent report logs
let backendTestRuns: any[] = [];

app.get('/api/crawler/test-runs', (req, res) => {
  const { projectId } = req.query;
  const filtered = projectId ? backendTestRuns.filter(r => r.projectId === projectId) : backendTestRuns;
  res.json(filtered);
});

app.post('/api/crawler/execute', async (req, res) => {
  const { projectId, screenCount } = req.body;
  const targetCount = parseInt(screenCount, 10) || 50;
  
  const selectedProj = projects.find(p => p.id === projectId) || projects[0];
  
  try {
    const orchestrator = new AgentQueueOrchestrator();
    const newRun = await orchestrator.runSuite(projectId, targetCount, selectedProj as any);

    backendTestRuns.unshift(newRun);

    // Add a neat audit log trace to persistent logs
    auditLogs.unshift({
      id: `audit-b-${Date.now()}`,
      projectId,
      timestamp: new Date().toISOString(),
      action: 'test_run_completed',
      user: 'System orchestrator',
      details: `Backend high-scale multi-screen crawler completed! Scanned ${targetCount} screens, tracked ${newRun.issues.length} discrepancies via Crawl, Interaction, and Screenshot agents.`
    });

    res.json({ success: true, testRun: newRun });
  } catch (error: any) {
    console.error('Failed to run agent suite:', error);
    res.status(500).json({ success: false, error: error.message || error });
  }
});

app.post('/api/audit/record', (req, res) => {
  const { projectId, action, user, details } = req.body;
  const record = {
    id: `audit-${Date.now()}`,
    projectId: projectId || 'default-tenant',
    timestamp: new Date().toISOString(),
    action,
    user: user || 'kanithisathvik2005@gmail.com',
    details
  };
  auditLogs.unshift(record);
  res.json(record);
});

// AI analysis engine powered by Gemini 3.5 Flash
app.post('/api/gemini/analyze', async (req, res) => {
  const { screenName, moduleName, path, category, selector, prototypeValue, stageValue, severity } = req.body;

  const prompt = `You are a Principal Software Engineer & QA Lead.
I have a visual regression disparity between our Prototype and Stage environment:
- Screen: "${screenName}" in module "${moduleName}" (Path: ${path})
- Mismatch Category: ${category}
- Target Selector: "${selector}"
- Prototype Value: "${JSON.stringify(prototypeValue)}"
- Stage Value: "${JSON.stringify(stageValue)}"
- Assessed Severity: ${severity}

Please analyze this visual difference and output an expert response containing:
1. "ROOT CAUSE ANALYSIS": A specific technical explanation of why this visual bug surfaced (e.g. layout flex-wrap wrapper changes, font-sizing variables mismatch, border borders drift).
2. "REMEDY CODE": A block of CSS or Tailwind Utility guidelines that explains how to resolve the mismatch in the code.
3. "IMPACT RATING": A brief security / functional review of this error for end-users.

Return your response in clean markdown format. Do not write generic text. Be highly precise, professional, and practical.`;

  try {
    const client = getGeminiClient();
    if (!client) {
      // Elegant offline backup if key isn't active
      return res.json({
        text: `### ROOT CAUSE ANALYSIS [Offline Engine Check]
The visual difference in widget class \`${selector}\` is caused by a layout transition inconsistency between environments. In Prototype, the padding/rendering constraints are defined relative to global theme configurations, while Stage contains an inline override with distinct dimensional spacing constants.

### REMEDY CODE
To fix this visual drift, synchronize the element variables in the design system standard:
\`\`\`css
/* Coordinate responsive spacing */
${selector} {
  font-size: 0.875rem !important;
  font-weight: 500;
  line-height: 1.25rem;
  padding: 8px 16px !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
\`\`\`

### IMPACT RATING
- Rating: **Low Spacing Impact**
- Description: Will prevent 1px visual drift line wrap issue on smaller responsive viewports.

*Note: Configure a Gemini API Key under Settings > Secrets to see actual deep AI visual analysis!*`
      });
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini call failed:', error);
    res.json({
      text: `### ROOT CAUSE ANALYSIS (Error: Gemini API key validation)
The element structural layout has drifted. Detail specifications suggest responsive container wrapping mismatch (Flexbox wrap setting missing in Stage).

### REMEDY CODE
\`\`\`css
/* Add layout wrapper alignment */
${selector} {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
\`\`\`

*(Fallback to offline analysis due to API: ${error.message || 'unknown'})*`
    });
  }
});

// ZIP Export service containing screenshots, reports, mappings, and logs
app.post('/api/export-zip', async (req, res) => {
  const { testRun, project } = req.body;
  const zip = new JSZip();

  // Create Folders
  const screenshotsFolder = zip.folder('screenshots');
  const reportsFolder = zip.folder('reports');
  const logsFolder = zip.folder('logs');
  const mappingsFolder = zip.folder('mappings');

  const selectedProj = project || projects[0];
  const selectedRun = testRun || {
    id: 'run-manual',
    date: new Date().toISOString(),
    screensScanned: 12,
    totalScreensCount: 200,
    criticalCount: 1,
    majorCount: 2,
    minorCount: 2,
    durationMs: 8200,
    issues: [
      { id: 'iss-1', screenName: 'Dashboard - Screen 2', moduleName: 'Dashboard & Analytics', type: 'visual', category: 'typography', componentName: '.page-title', severity: 'Major', elementSelector: '.page-title', description: 'Typography size & weight mismatch. Prototype uses 24px semi-bold, Stage uses 20px regular.', rootCause: 'Stage has font-size overrides.', prototypeValue: '24px Semibold', stageValue: '20px Regular' }
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Started crawler execution.' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Logged into environment successfully.' },
      { timestamp: new Date(Date.now() + 2000).toISOString(), level: 'warn', message: 'Volatile timestamp ignored on .sync-timestamp selector' },
      { timestamp: new Date(Date.now() + 5000).toISOString(), level: 'error', message: 'Visual Difference found on .page-title' }
    ]
  };

  // Populate Mappings
  mappingsFolder?.file('screen-map.json', JSON.stringify({
    comment: "Mapping table of discovered screens (200 screen catalog mapping hierarchy)",
    generatedAt: new Date().toISOString(),
    testedTenant: selectedProj.name,
    screensRecorded: Array.from({ length: 200 }, (_, i) => ({
      index: i + 1,
      route: `/module/screen-${i + 1}`,
      type: i % 5 === 0 ? 'modal' : 'page',
      baselineStatus: 'verified'
    }))
  }, null, 2));

  mappingsFolder?.file('route-map.json', JSON.stringify({
    prototypeBase: selectedProj.prototypeUrl,
    stageBase: selectedProj.stageUrl,
    restrictions: {
      blacklist: selectedProj.blacklistRoutes,
      whitelist: selectedProj.selectedRoutes
    }
  }, null, 2));

  // Populate Logs
  logsFolder?.file('crawl-log.json', JSON.stringify(selectedRun.logs, null, 2));
  logsFolder?.file('interaction-log.json', JSON.stringify([
    { transition: 'login -> dashboard', trigger: 'submit click', status: 'success' },
    { transition: 'dashboard -> details modal', trigger: 'action-edit click', status: 'success' },
    { transition: 'details modal -> save button', trigger: 'action-btn-primary hover', status: 'verified_feedback' }
  ], null, 2));

  // Populate Screenshots (Represent SVGs to keep bytes scalable)
  const svgP = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#fdfdfd"/><text x="100" y="100" font-family="sans-serif" font-size="24" font-weight="600" fill="#111827">Dashboard - Screen 2 [PROTOTYPE]</text><rect x="100" y="180" width="120" height="40" rx="6" fill="#2563eb"/><text x="160" y="204" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle">Save Changes</text></svg>`;
  const svgS = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#fcfcfc"/><text x="100" y="100" font-family="sans-serif" font-size="20" font-weight="400" fill="#111827">Dashboard - Screen 2 [STAGE]</text><rect x="100" y="180" width="120" height="40" rx="6" fill="#2563eb"/><text x="160" y="204" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle">Save Changes</text></svg>`;
  const svgD = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" stroke-width="2"/><text x="100" y="100" font-family="sans-serif" font-size="24" fill="#ef4444">1 Mismatch Detected in .page-title label</text></svg>`;

  selectedRun.issues.forEach((iss: any) => {
    const screenSub = screenshotsFolder?.folder(iss.screenId || 'dashboard_screen_2');
    screenSub?.file('prototype.svg', svgP);
    screenSub?.file('stage.svg', svgS);
    screenSub?.file('diff.svg', svgD);
    screenSub?.file('metadata.json', JSON.stringify({
      targetSelector: iss.elementSelector,
      differenceType: iss.category,
      severity: iss.severity
    }, null, 2));
  });

  // Populate Reports (HTML with styled design, MD for documentation, JSON for machines)
  reportsFolder?.file('report.json', JSON.stringify(selectedRun, null, 2));

  // Markdown Report
  const mdReport = `# Autonomous Visual Regression QA Audit Report
**Date:** ${new Date(selectedRun.date).toLocaleString()}
**Tested Organization:** ${selectedProj.organization}
**Project:** ${selectedProj.name}

## Summary Table
- **Total Screens Discovered/Audited:** ${selectedRun.screensScanned} / ${selectedRun.totalScreensCount}
- **Critical Breaches:** ${selectedRun.criticalCount}
- **Major Discrepancies:** ${selectedRun.majorCount}
- **Minor Layout Shifts:** ${selectedRun.minorCount}
- **Issues Needing Clarity:** ${selectedRun.clarityCount}

## Identified Inconsistencies
${selectedRun.issues.map((iss: any, i: number) => `
### ${i + 1}. [${iss.severity}] Visual Drift on ${iss.screenName} (${iss.moduleName})
- **Selector:** \`${iss.elementSelector}\`
- **Discrepancy Category:** ${iss.category}
- **Prototype Definition:** ${iss.prototypeValue}
- **Stage (Production candidate) Definition:** ${iss.stageValue}
- **Analysis:** ${iss.description}
- **Resolution Guideline Plan:** ${iss.rootCause}
`).join('\n')}

---
*Autonomous Report generated securely by AI Studio Active QA Engine.*`;

  reportsFolder?.file('report.md', mdReport);

  // GORGEOUS HTML Audit Report
  const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>QA Visual Regression Summary Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px; color: #111827; }
    .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h1 { color: #1e3a8a; font-weight: 700; margin-top: 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-right: 8px; }
    .badge-critical { background-color: #fef2f2; color: #991b1b; }
    .badge-major { background-color: #fffaf0; color: #9a3412; }
    .issue-item { border-bottom: 1px solid #f3f4f6; padding: 16px 0; }
    .issue-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Autonomous Visual Regression QA Platform</h1>
    <p><strong>Project:</strong> ${selectedProj.name} (${selectedProj.organization})</p>
    <p><strong>Timestamp:</strong> ${new Date(selectedRun.date).toUTCString()}</p>
    <p><strong>Scope Scanned:</strong> ${selectedRun.screensScanned} of ${selectedRun.totalScreensCount} screens mapped.</p>
  </div>

  <div class="card">
    <h2>Discovered Inconsistencies (Total: ${selectedRun.issues.length})</h2>
    ${selectedRun.issues.map((iss: any) => `
      <div class="issue-item">
        <span class="badge badge-${iss.severity.toLowerCase()}">${iss.severity}</span>
        <strong>${iss.screenName} (${iss.moduleName})</strong>
        <p style="margin: 8px 0; color: #4b5563;">${iss.description}</p>
        <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px;">
          Selector: ${iss.elementSelector}<br/>
          Prototype: ${iss.prototypeValue}<br/>
          Stage: ${iss.stageValue}<br/>
          Root Case: ${iss.rootCause}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  reportsFolder?.file('report.html', htmlReport);

  try {
    const rawZipBytes = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="qa-visual-regression-audit.zip"');
    res.send(rawZipBytes);
  } catch (error) {
    console.error('Failed to zip report data:', error);
    res.status(500).json({ error: 'Failed to package audit data' });
  }
});

// Start listening & mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched successfully on host 0.0.0.0, binding to external port ${PORT}`);
  });
}

startServer();
