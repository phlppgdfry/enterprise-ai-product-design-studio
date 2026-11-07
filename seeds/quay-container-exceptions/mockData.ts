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
    "id": "CNT-901",
    "employeeName": "MSCU-849201-4 (40ft HC Reefer)",
    "employeeRole": "Berth Q-14 · Carrier: MSC Mediterranean",
    "identityStatus": "SEAL_MISMATCH",
    "incidentRef": "EDI-MANIFEST-4410",
    "evidenceSummary": "Physical seal #SL-99214 does not match manifest #SL-99280; reefer temp +4.2°C (threshold +2.0°C).",
    "escoSkillName": "Customs & Cold-Chain Gate Hold Required",
    "escoUri": "urn:port:sla:reefer-seal-protocol-v3",
    "revisionHash": "eta+185m",
    "status": "PENDING_REVIEW",
    "syncAttempts": 1,
    "lastUpdated": "2026-11-07 04:10 CET"
  },
  {
    "id": "CNT-902",
    "employeeName": "MAEU-331094-0 (40ft Dry)",
    "employeeRole": "Berth Q-08 · Carrier: Maersk Line",
    "identityStatus": "VERIFIED",
    "incidentRef": "EDI-MANIFEST-4418",
    "evidenceSummary": "Customs NCTS clearance verified; seal intact; scheduled for Bay W-04 cross-docking.",
    "escoSkillName": "Cleared for Automated Gate Handover",
    "escoUri": "urn:port:sla:standard-gate-clearance",
    "revisionHash": "eta+0m",
    "status": "APPROVED",
    "syncAttempts": 1,
    "lastUpdated": "2026-11-07 04:12 CET"
  },
  {
    "id": "CNT-903",
    "employeeName": "CMAU-772190-8 (20ft Tank)",
    "employeeRole": "Berth Q-19 · Carrier: CMA CGM",
    "identityStatus": "IDENTITY_BLOCKED",
    "incidentRef": "EDI-MANIFEST-4425",
    "evidenceSummary": "Missing ADR hazardous cargo declaration sheet; terminal crane discharge paused pending DG sign-off.",
    "escoSkillName": "ADR Dangerous Goods Documentation Hold",
    "escoUri": "urn:port:sla:adr-dg-hold-protocol",
    "revisionHash": "eta+240m",
    "status": "IDENTITY_BLOCKED",
    "syncAttempts": 0,
    "lastUpdated": "2026-11-07 04:15 CET"
  }
];
