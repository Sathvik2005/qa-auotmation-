export type Severity = 'Critical' | 'Major' | 'Minor' | 'Clarity Needed';

export type IssueCategory = 'layout' | 'typography' | 'color' | 'component' | 'interaction';

export interface Credentials {
  id: string;
  role: string;
  username: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  organization: string;
  prototypeUrl: string;
  stageUrl: string;
  credentials: Credentials[];
  selectedRoutes: string[]; // Screen IDs
  blacklistRoutes: string[];
  maskingRules: string[]; // DOM selectors for volatile elements
  scheduleCron?: string;
  scheduleEnabled?: boolean;
  
  // --- New Enterprise QA Reliability Configurations ---
  retryAttempts?: number;
  crawlStabilizationWaitMs?: number;
  screenshotDiffThresholdPercent?: number;
  enableAntiHallucination?: boolean;
  enableLiveDataIgnoreSelector?: boolean;
  whitelistRoutesRegex?: string;
  enableInteractionReplayLogging?: boolean;
  enableSessionRecovery?: boolean;
  baselineApprovalMode?: 'instant' | 'requires_reviewer' | 'requires_double_reviewer';
}

export interface ElementState {
  selector: string;
  type: string;
  text: string;
  styles: Record<string, string>;
}

export interface ScreenCompareData {
  id: string;
  moduleId: string;
  name: string;
  path: string;
  type: 'page' | 'modal' | 'drawer' | 'dropdown' | 'hover';
  elements: {
    prototype: ElementState[];
    stage: ElementState[];
  };
  screenshotData?: {
    prototypeSvg: string;
    stageSvg: string;
    diffSvg: string;
  };
}

export interface Module {
  id: string;
  name: string;
}

export interface Issue {
  id: string;
  testRunId: string;
  screenId: string;
  screenName: string;
  moduleId: string;
  moduleName: string;
  type: 'visual' | 'functional';
  category: IssueCategory;
  componentName: string;
  severity: Severity;
  elementSelector: string;
  description: string;
  rootCause: string;
  prototypeValue: string;
  stageValue: string;
  aiExplanation?: string;
  status: 'pending' | 'approved' | 'dismissed_false_positive' | 'promoted_baseline';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  date: string;
  status: 'pending' | 'crawling' | 'comparing' | 'analyzing' | 'completed' | 'failed';
  screensScanned: number;
  totalScreensCount: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  clarityCount: number;
  durationMs: number;
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error'; message: string }>;
  issues: Issue[];
}

export interface AuditRecord {
  id: string;
  projectId: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}
