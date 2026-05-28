import { ScreenCompareData, Module } from '../types';

export const ENTERPRISE_MODULES: Module[] = [
  { id: 'analytics', name: 'Dashboard & Analytics' },
  { id: 'crm', name: 'Customer Management (CRM)' },
  { id: 'billing', name: 'Invoicing & Subscription' },
  { id: 'team', name: 'Team Collaboration Hub' },
  { id: 'dev', name: 'Developer Platform & API' },
  { id: 'integrations', name: 'App Integrations & Webhooks' },
  { id: 'security', name: 'Security & Access Control' },
  { id: 'reporting', name: 'Advanced Financial Reporting' },
  { id: 'settings', name: 'Platform Settings & Branding' },
  { id: 'support', name: 'Helpdesk & Support tickets' }
];

// Seed descriptions for each screen to allow rich AI analysis and rendering
export function generate200Screens(): ScreenCompareData[] {
  const screens: ScreenCompareData[] = [];

  // Map modules
  ENTERPRISE_MODULES.forEach((m) => {
    // Generate 20 distinct screens for each module = 200 screens total
    for (let index = 1; index <= 20; index++) {
      const screenId = `${m.id}-${index}`;
      const path = `/${m.id}/${index === 1 ? 'overview' : `view-${index}`}`;
      let type: 'page' | 'modal' | 'drawer' | 'dropdown' | 'hover' = 'page';
      
      if (index % 5 === 0) type = 'modal';
      else if (index % 7 === 0) type = 'drawer';
      else if (index % 9 === 0) type = 'dropdown';

      // Seed element states with differences for specific screens
      const hasVisualIssue = index === 2 || index === 8 || index === 14;
      const hasFunctionalIssue = index === 5 || index === 12;
      const hasDynamicValue = index === 1 || index === 10;

      // Primary element setup (e.g. Header, Button, Table, Grid, etc.)
      const protoElements: any[] = [
        {
          selector: '.page-title',
          type: 'text',
          text: `${m.name} - Screen ${index}`,
          styles: { fontSize: '24px', fontWeight: '600', color: '#111827', margin: '16px' }
        },
        {
          selector: '.action-btn-primary',
          type: 'button',
          text: 'Save Changes',
          styles: {
            fontSize: '14px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            opacity: '1'
          }
        },
        {
          selector: '.data-grid-container',
          type: 'layout',
          text: 'Content container',
          styles: {
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }
        }
      ];

      const stageElements = JSON.parse(JSON.stringify(protoElements));

      // Inject seeded visual errors
      if (hasVisualIssue) {
        if (index === 2) {
          // Typography issue: Incorrect font-weight and padding in stage
          stageElements[0].styles.fontWeight = '400';
          stageElements[0].styles.fontSize = '20px';
          stageElements[0].styles.margin = '24px';
        } else if (index === 8) {
          // Alignment mismatch / Flex structure shift
          stageElements[1].styles.padding = '12px 24px'; 
          stageElements[1].styles.backgroundColor = '#1d4ed8'; // Slight color drift
          stageElements[1].styles.borderRadius = '12px'; // Border-radius drift (1px shift)
        } else if (index === 14) {
          // Border and shadowing visual drift
          stageElements[2].styles.border = '2px solid #ef4444'; // Red border instead of grey
          stageElements[2].styles.boxShadow = '0 10px 15px rgba(0,0,0,0.2)'; // Intense shadow mismatch
        }
      }

      // Inject functional validation points
      if (hasFunctionalIssue) {
        if (index === 5) {
          protoElements.push({
            selector: '.interactive-modal-trigger',
            type: 'button',
            text: 'Open Settings Panel',
            styles: { fontSize: '13px', backgroundColor: '#4b5563', padding: '6px 12px', border: '1px solid #d1d5db', opacity: '0.5' } // disabled-like state in prototype
          });
          stageElements.push({
            selector: '.interactive-modal-trigger',
            type: 'button',
            text: 'Open Settings Panel',
            styles: { fontSize: '13px', backgroundColor: '#4b5563', padding: '6px 12px', border: '1px solid #d1d5db', opacity: '1' } // fully responsive in stage
          });
        } else if (index === 12) {
          protoElements.push({
            selector: '.nav-tab-integrations',
            type: 'link',
            text: 'Connect Slack Sync',
            styles: { color: '#ef4444', border: '1px solid currentColor', borderRadius: '4px' } // broken route layout
          });
          stageElements.push({
            selector: '.nav-tab-integrations',
            type: 'link',
            text: 'slack://connect-oauth',
            styles: { color: '#2563eb', border: '1px solid currentColor', borderRadius: '4px' }
          });
        }
      }

      // Inject Dynamic fields (timestamps, token IDs, visitor counts)
      if (hasDynamicValue) {
        // Prototype timestamp vs Stage timestamp
        protoElements.push({
          selector: '.sync-timestamp',
          type: 'text',
          text: 'Synced: 2026-05-28 05:14:02 UTC',
          styles: { fontSize: '12px', color: '#6b7280' }
        });
        stageElements.push({
          selector: '.sync-timestamp',
          type: 'text',
          text: 'Synced: 14 minutes ago',
          styles: { fontSize: '12px', color: '#6b7280' }
        });
      }

      screens.push({
        id: screenId,
        moduleId: m.id,
        name: `${m.name} - Screen ${index}`,
        path,
        type,
        elements: {
          prototype: protoElements,
          stage: stageElements
        }
      });
    }
  });

  return screens;
}

export const SEEDED_SCREENS = generate200Screens();
