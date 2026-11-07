export interface OperationalRecord {
  id: string;
  employeeName: string;
  employeeRole: string;
  identityStatus: 'VERIFIED' | 'IDENTITY_BLOCKED' | 'SEAL_MISMATCH';
  incidentRef: string;
  evidenceSummary: string;
  escoSkillName: string;
  escoUri: string;
  revisionHash: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'IDENTITY_BLOCKED';
  syncAttempts: number;
  lastUpdated: string;
}

export const INITIAL_RECORDS: OperationalRecord[] = [
  {
    "id": "AUD-301",
    "employeeName": "Checkout & Subscription Upgrade Flow",
    "employeeRole": "Product Surface · Billing & Entitlements",
    "identityStatus": "VERIFIED",
    "incidentRef": "MP-DESIGN-7712",
    "evidenceSummary": "Remediated CTA contrast from 2.34:1 to 6.70:1 and added explicit HTTP 429 retry banner.",
    "escoSkillName": "Variant A: Split Summary & Inline Recovery",
    "escoUri": "https://www.magicpatterns.com/product/mcp#variant-a",
    "revisionHash": "mp-v3-88a1",
    "status": "PENDING_REVIEW",
    "syncAttempts": 1,
    "lastUpdated": "2026-11-07 04:20 CET"
  },
  {
    "id": "AUD-302",
    "employeeName": "Enterprise Knowledge Triage Workbench",
    "employeeRole": "Product Surface · AI Support Operations",
    "identityStatus": "VERIFIED",
    "incidentRef": "MP-DESIGN-7719",
    "evidenceSummary": "Mapped arbitrary Tailwind hex classes to Northstar semantic tokens; verified 100% keyboard focus ring.",
    "escoSkillName": "Variant B: Progressive Disclosure Triage",
    "escoUri": "https://www.magicpatterns.com/product/mcp#variant-b",
    "revisionHash": "mp-v3-92f4",
    "status": "APPROVED",
    "syncAttempts": 1,
    "lastUpdated": "2026-11-07 04:22 CET"
  },
  {
    "id": "AUD-303",
    "employeeName": "Legacy Partner Onboarding Portal",
    "employeeRole": "Product Surface · External B2B Portal",
    "identityStatus": "IDENTITY_BLOCKED",
    "incidentRef": "MP-DESIGN-7725",
    "evidenceSummary": "Blocked from code export: missing empty state and unmapped third-party icon imports.",
    "escoSkillName": "Requires Token Remediation Before Export",
    "escoUri": "https://www.magicpatterns.com/product/mcp#remediation",
    "revisionHash": "mp-v3-11b9",
    "status": "IDENTITY_BLOCKED",
    "syncAttempts": 0,
    "lastUpdated": "2026-11-07 04:25 CET"
  }
];
