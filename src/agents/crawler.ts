import { Project, TestRun, Issue, Severity, IssueCategory } from '../types';

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface AgentContext {
  projectId: string;
  screenCount: number;
  projectConfig: Project;
  runId: string;
}

// 1. Crawl Agent Interface & Implementation
export interface CrawlAgent {
  name: string;
  discoverRoutes(context: AgentContext): Promise<{
    discoveredPaths: string[];
    logs: AgentLog[];
  }>;
}

export class DefaultCrawlAgent implements CrawlAgent {
  name = 'Crawl Agent (Route Discovery)';

  async discoverRoutes(context: AgentContext): Promise<{ discoveredPaths: string[]; logs: AgentLog[] }> {
    const logs: AgentLog[] = [];
    const timestampStr = () => new Date().toLocaleTimeString();
    
    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Crawl Agent] Initialized crawl discovery for project: "${context.projectConfig.name}"`
    });

    const blacklist = context.projectConfig.blacklistRoutes || [];
    const whitelist = context.projectConfig.selectedRoutes || [];
    const maxCount = context.screenCount;
    
    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Crawl Agent] Applying path restrictions. Whitelist has ${whitelist.length} routes; Blacklist hosts: ${blacklist.join(', ') || 'none'}`
    });

    // Simulate route scanning
    const discovered: string[] = [];
    const targetCount = Math.min(maxCount, 200);

    for (let i = 1; i <= targetCount; i++) {
      const pathStr = `/platform/view/screen-${i}`;
      const isBlacklisted = blacklist.some(b => {
        if (b.endsWith('*')) {
          return pathStr.startsWith(b.slice(0, -1));
        }
        return pathStr === b;
      });

      if (!isBlacklisted) {
        discovered.push(pathStr);
      }
    }

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Crawl Agent] Route discovery finished cleanly. Mapped ${discovered.length} active relative URLs, reached 100% path coverage.`
    });

    return {
      discoveredPaths: discovered,
      logs
    };
  }
}

// 2. Interaction Agent Interface & Implementation
export interface InteractionAgent {
  name: string;
  validateInteractions(context: AgentContext, paths: string[]): Promise<{
    sessionActive: boolean;
    interactionLogs: string[];
    logs: AgentLog[];
  }>;
}

export class DefaultInteractionAgent implements InteractionAgent {
  name = 'Interaction Agent (Session Replacer)';

  async validateInteractions(context: AgentContext, paths: string[]): Promise<{
    sessionActive: boolean;
    interactionLogs: string[];
    logs: AgentLog[];
  }> {
    const logs: AgentLog[] = [];
    const interactionLogs: string[] = [];
    const timestampStr = () => new Date().toLocaleTimeString();

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Interaction Agent] Active authorization initiated under role priority setup.`
    });

    const credentials = context.projectConfig.credentials || [];
    const activeUser = credentials[0]?.username || 'admin@agent-fleet.org';
    const activeRole = credentials[0]?.role || 'System Administrator';

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Interaction Agent] Successfully authenticated user session: "${activeUser}" (${activeRole})`
    });

    // Handle replay action simulation
    const waitTime = context.projectConfig.crawlStabilizationWaitMs || 450;
    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Interaction Agent] Replaying actions on dynamic states. Applying stabilization latch time: ${waitTime}ms`
    });

    interactionLogs.push(`Session init: ${activeUser}`);
    if (paths.length > 0) {
      interactionLogs.push(`Navigate -> ${paths[0]}`);
      interactionLogs.push(`DOM Click -> .action-btn-primary`);
      if (context.projectConfig.enableInteractionReplayLogging) {
        interactionLogs.push(`Logged focus state elements for replay compliance auditing.`);
      }
    }

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Interaction Agent] Actions replayed and synchronized flawlessly across ${paths.length} nodes.`
    });

    return {
      sessionActive: true,
      interactionLogs,
      logs
    };
  }
}

// 3. Screenshot Agent Interface & Implementation
export interface ScreenshotAgent {
  name: string;
  performVisualAudit(
    context: AgentContext,
    paths: string[]
  ): Promise<{
    issues: Issue[];
    logs: AgentLog[];
  }>;
}

export class DefaultScreenshotAgent implements ScreenshotAgent {
  name = 'Screenshot Agent (Visual & DOM Comparator)';

  async performVisualAudit(context: AgentContext, paths: string[]): Promise<{ issues: Issue[]; logs: AgentLog[] }> {
    const logs: AgentLog[] = [];
    const issues: Issue[] = [];
    const timestampStr = () => new Date().toLocaleTimeString();

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Screenshot Agent] Commencing precise canvas captures for ${paths.length} layouts...`
    });

    const ignoreRuleCount = context.projectConfig.maskingRules?.length || 0;
    if (ignoreRuleCount > 0 && context.projectConfig.enableLiveDataIgnoreSelector) {
      logs.push({
        timestamp: timestampStr(),
        level: 'warn',
        message: `[Screenshot Agent] Discarding visual variance triggers on ${ignoreRuleCount} DOM exception selectors: [${context.projectConfig.maskingRules?.join(', ')}]`
      });
    }

    const threshold = context.projectConfig.screenshotDiffThresholdPercent || 0.05;
    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Screenshot Agent] Visual threshold tolerance is bound to ${(threshold * 100).toFixed(1)}%`
    });

    const isLogik = context.projectId === 'logikintake-tenant';

    // Seed realistic issues based on the tenant configurations
    if (isLogik) {
      issues.push(
        {
          id: `iss-b-1-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'admin-setup-2',
          screenName: 'Rule Config Hub',
          moduleId: 'admin-setup',
          moduleName: 'Admin Setup Hub',
          type: 'visual',
          category: 'typography',
          componentName: '.page-title',
          severity: 'Critical',
          elementSelector: '.page-title',
          description: '[Generated by Screenshot Agent] Prototype defines display-heading typography with weighted Space Grotesk at 24px, while Stage loads default Sans-serif at 20px regular, causing extreme aesthetic mismatch on AI-native intake branding.',
          rootCause: 'Incorrect CSS font inheritance rule in stage deploy code.',
          prototypeValue: 'Font-Size: 24px, Font-Family: Space Grotesk, Weight: 600',
          stageValue: 'Font-Size: 20px, Font-Family: Inter, Weight: 400',
          status: 'pending'
        },
        {
          id: `iss-b-2-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'operator-setup-8',
          screenName: 'Operator Assignment Panel',
          moduleId: 'operator-setup',
          moduleName: 'Operator Setup Desk',
          type: 'visual',
          category: 'layout',
          componentName: '.action-btn-primary',
          severity: 'Major',
          elementSelector: '.action-btn-primary',
          description: '[Generated by Screenshot Agent] Button padding is misaligned in Stage (12px 24px, rounded-xl 12px) compared to the Prototype standard (8px 16px, rounded-md 6px), breaking spacing alignments on the multi-tenant delegation dashboard.',
          rootCause: 'Stale style class tags in stage candidate build branch.',
          prototypeValue: 'Padding: 8px 16px, Border-Radius: 6px, Color: #2563eb',
          stageValue: 'Padding: 12px 24px, Border-Radius: 12px, Color: #1d4ed8 (Slightly darker)',
          status: 'pending'
        },
        {
          id: `iss-b-3-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'classification-review-14',
          screenName: 'Document Separator Card',
          moduleId: 'classification-review',
          moduleName: 'Classification Review Stack',
          type: 'visual',
          category: 'color',
          componentName: '.data-grid-container',
          severity: 'Major',
          elementSelector: '.data-grid-container',
          description: '[Generated by Screenshot Agent] High priority mismatch: Stage displays a crimson red border highlight boundary on page stack preview nodes instead of clean neutral boundaries, suggesting false-positive error triggers to the intake validators.',
          rootCause: 'Default verification CSS variables mapped wrongly.',
          prototypeValue: 'Border: 1px solid #e5e7eb, Shadow: Minimal Accent',
          stageValue: 'Border: 2px solid #ef4444 (Crimson), Shadow: Expanded Outline Mismatch',
          status: 'pending'
        },
        {
          id: `iss-b-4-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'database-sync-3',
          screenName: 'Spanner Sync Console',
          moduleId: 'database-sync',
          moduleName: 'Spanner Database Sync',
          type: 'functional',
          category: 'component',
          componentName: '.database-schema-grid',
          severity: 'Critical',
          elementSelector: '.database-schema-grid',
          description: '[Generated by Screenshot Agent] Database query mismatch in stage. The Spanner staging cluster displays unindexed queries with high execution latency (250ms) on schema transaction indexes, whereas the prototype configuration defines a highly optimized 12ms secondary index.',
          rootCause: 'Missing index definitions in the candidate database migration script.',
          prototypeValue: 'Secondary Index: idx_loans_by_timestamp_v2, Latency: 12ms',
          stageValue: 'Table Scan (Unindexed), Latency: 250ms, Error: Query Warning SLA breached',
          status: 'pending'
        }
      );
    } else {
      issues.push(
        {
          id: `iss-b-d1-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'analytics-2',
          screenName: 'Dashboard - Screen 2',
          moduleId: 'analytics',
          moduleName: 'Dashboard & Analytics',
          type: 'visual',
          category: 'typography',
          componentName: '.page-title',
          severity: 'Major',
          elementSelector: '.page-title',
          description: '[Generated by Screenshot Agent] Font size and font weight mismatch in header. Title text shrinks from 24px semi-bold to 20px regular, causing layout line wraps.',
          rootCause: 'Header title styles configured differently in Stage vs Prototype.',
          prototypeValue: 'Font-Size: 24px, Font-Weight: 600 (Semibold)',
          stageValue: 'Font-Size: 20px, Font-Weight: 400 (Regular)',
          status: 'pending'
        },
        {
          id: `iss-b-d2-${Date.now()}`,
          testRunId: context.runId,
          screenId: 'analytics-14',
          screenName: 'Dashboard - Screen 14',
          moduleId: 'analytics',
          moduleName: 'Dashboard & Analytics',
          type: 'visual',
          category: 'color',
          componentName: '.data-grid-container',
          severity: 'Critical',
          elementSelector: '.data-grid-container',
          description: '[Generated by Screenshot Agent] Primary visual card contains a bright red border mismatch instead of default grey. Deep shadow differences found.',
          rootCause: 'Stage has layout overrides on data container borders.',
          prototypeValue: 'Border: 1px solid #e5e7eb, Shadow: Light',
          stageValue: 'Border: 2px solid #ef4444, Shadow: High Intensity Red Highlight',
          status: 'pending'
        }
      );
    }

    // Dynamic escalations for screen counts
    if (context.screenCount >= 20) {
      issues.push({
        id: `iss-b-ext1-${Date.now()}`,
        testRunId: context.runId,
        screenId: `scanned-route-24`,
        screenName: `Custom Screen 24 (Workspace Analytics)`,
        moduleId: isLogik ? 'classification-review' : 'analytics',
        moduleName: isLogik ? 'Classification Review Stack' : 'Dashboard & Analytics',
        type: 'visual',
        category: 'layout',
        componentName: '.responsive-sidebar-wrapper',
        severity: 'Major',
        elementSelector: '.responsive-sidebar-wrapper',
        description: '[Generated by Screenshot Agent] Sidebar layout boundaries are overlapping standard content grids on mobile-viewport scaling tests inside Stage. Real width is bound to 320px in stage, overriding responsive dynamic styles.',
        rootCause: 'Hardcoded pixel width in the candidate styles bundle.',
        prototypeValue: 'Width: 100% max-w-xs with transitions',
        stageValue: 'Width: 320px fixed layout override',
        status: 'pending'
      });
    }

    if (context.screenCount >= 75) {
      issues.push({
        id: `iss-b-ext2-${Date.now()}`,
        testRunId: context.runId,
        screenId: `scanned-route-65`,
        screenName: `System Screen 65 (Billing Details & JWT)`,
        moduleId: isLogik ? 'validation-review' : 'billing',
        moduleName: isLogik ? 'Validation Review Rulebook' : 'Billing & Subscriptions',
        type: 'functional',
        category: 'component',
        componentName: '.volatile-jwt-display',
        severity: 'Critical',
        elementSelector: '.volatile-jwt-display',
        description: '[Generated by Screenshot Agent] Unmasked session secret variables. Stage displays volatile session identifiers directly inside client DOM nodes without applying active masking credentials rules.',
        rootCause: 'Missing masking override selector filter in stage security headers configuration.',
        prototypeValue: '[HIDDEN INTEL MASKED]',
        stageValue: 'jwt-token-token_value_xyz...',
        status: 'pending'
      });
    }

    if (context.screenCount >= 150) {
      issues.push({
        id: `iss-b-ext3-${Date.now()}`,
        testRunId: context.runId,
        screenId: `scanned-route-132`,
        screenName: `Component Screen 132 (Cloud Spanner Write Latencies)`,
        moduleId: isLogik ? 'database-sync' : 'analytics',
        moduleName: isLogik ? 'Spanner Database Sync' : 'Dashboard & Analytics',
        type: 'functional',
        category: 'interaction',
        componentName: '.latency-bar-metric',
        severity: 'Critical',
        elementSelector: '.latency-bar-metric',
        description: '[Generated by Screenshot Agent] Stage Cloud Spanner transactions lagging by 45 seconds on high-concurrency mutation threads. Critical breach of the 2-seconds real-time SLA.',
        rootCause: 'Missing schema indices on high scale write transactions script.',
        prototypeValue: 'Replica Lag: 28ms',
        stageValue: 'Replica Lag: 45000ms (High latency timeout)',
        status: 'pending'
      });
    }

    logs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Screenshot Agent] Capture & regression completed. Found ${issues.length} candidate discrepancies across all nodes.`
    });

    return {
      issues,
      logs
    };
  }
}

// 4. Queue / Orchestrator which binds these agents together
export class AgentQueueOrchestrator {
  private crawlAgent: CrawlAgent;
  private interactionAgent: InteractionAgent;
  private screenshotAgent: ScreenshotAgent;

  constructor(
    crawlAgent: CrawlAgent = new DefaultCrawlAgent(),
    interactionAgent: InteractionAgent = new DefaultInteractionAgent(),
    screenshotAgent: ScreenshotAgent = new DefaultScreenshotAgent()
  ) {
    this.crawlAgent = crawlAgent;
    this.interactionAgent = interactionAgent;
    this.screenshotAgent = screenshotAgent;
  }

  async runSuite(projectId: string, screenCount: number, projectConfig: Project): Promise<TestRun> {
    const runId = `run-agent-${Date.now()}`;
    const timestampStr = () => new Date().toLocaleTimeString();
    
    // Core logs collector
    const runLogs: AgentLog[] = [];
    
    runLogs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Layer 1 Orchestrator] Enqueuing multi-agent task queue for tenant "${projectConfig.name}".`
    });

    const context: AgentContext = {
      projectId,
      screenCount,
      projectConfig,
      runId
    };

    // Step 1: Run Crawl Agent
    runLogs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Queue Schedule] Dispatching Phase 1: "${this.crawlAgent.name}"`
    });
    const crawlRes = await this.crawlAgent.discoverRoutes(context);
    runLogs.push(...crawlRes.logs);

    // Step 2: Run Interaction Agent
    runLogs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Queue Schedule] Dispatching Phase 2: "${this.interactionAgent.name}"`
    });
    const interactionRes = await this.interactionAgent.validateInteractions(context, crawlRes.discoveredPaths);
    runLogs.push(...interactionRes.logs);

    // Step 3: Run Screenshot Agent
    runLogs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Queue Schedule] Dispatching Phase 3: "${this.screenshotAgent.name}"`
    });
    const screenshotRes = await this.screenshotAgent.performVisualAudit(context, crawlRes.discoveredPaths);
    runLogs.push(...screenshotRes.logs);

    runLogs.push({
      timestamp: timestampStr(),
      level: 'info',
      message: `[Layer 7 Orchestrator] Task execution queue completed successfully. Synthesizing full XML and JSON reports.`
    });

    const issues = screenshotRes.issues;
    const criticalCount = issues.filter(i => i.severity === 'Critical').length;
    const majorCount = issues.filter(i => i.severity === 'Major').length;
    const minorCount = issues.filter(i => i.severity === 'Minor').length;
    const clarityCount = issues.filter(i => i.severity === 'Clarity Needed').length;

    const testRun: TestRun = {
      id: runId,
      projectId,
      date: new Date().toISOString(),
      status: 'completed',
      screensScanned: screenCount,
      totalScreensCount: projectId === 'logikintake-tenant' ? 100 : 200,
      criticalCount,
      majorCount,
      minorCount,
      clarityCount,
      durationMs: screenCount * 420 + 2000,
      logs: runLogs,
      issues: issues
    };

    return testRun;
  }
}
