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
    "id": "EV-1042",
    "employeeName": "Elena Rostova",
    "employeeRole": "Senior Site Reliability Engineer",
    "identityStatus": "VERIFIED",
    "incidentRef": "INC-2026-8841",
    "evidenceSummary": "Mitigated Kubernetes ingress TLS rotation failure and authored automated post-mortem runbook.",
    "escoSkillName": "Cloud Infrastructure Incident Management",
    "escoUri": "http://data.europa.eu/esco/skill/8c4a1290-sre-incident",
    "revisionHash": "rev-84a2f1",
    "status": "PENDING_REVIEW",
    "syncAttempts": 0,
    "lastUpdated": "2026-11-07 03:40 CET"
  },
  {
    "id": "EV-1043",
    "employeeName": "Marcus Vandenberg",
    "employeeRole": "Platform Security Engineer",
    "identityStatus": "VERIFIED",
    "incidentRef": "INC-2026-8890",
    "evidenceSummary": "Isolated OAuth token scope leak in staging gateway and enforced strict audience validation tests.",
    "escoSkillName": "Identity & Access Management (IAM) Auditing",
    "escoUri": "http://data.europa.eu/esco/skill/4b91e021-iam-audit",
    "revisionHash": "rev-91c4d8",
    "status": "APPROVED",
    "syncAttempts": 2,
    "lastUpdated": "2026-11-07 03:42 CET"
  },
  {
    "id": "EV-1044",
    "employeeName": "Sanne De Vries",
    "employeeRole": "Data Integration Analyst",
    "identityStatus": "IDENTITY_BLOCKED",
    "incidentRef": "INC-2026-8904",
    "evidenceSummary": "Reconciled schema drift between warehouse EDI messages and ERP cost centers.",
    "escoSkillName": "Enterprise Data Schema Reconciliation",
    "escoUri": "http://data.europa.eu/esco/skill/2f77a310-data-schema",
    "revisionHash": "rev-30e9b2",
    "status": "IDENTITY_BLOCKED",
    "syncAttempts": 0,
    "lastUpdated": "2026-11-07 03:45 CET"
  }
];
