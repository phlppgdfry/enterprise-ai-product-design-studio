import React, { useState } from 'react';
import { INITIAL_RECORDS, OperationalRecord } from './mockData';

export type ViewStateMode = 'interactive' | 'empty' | 'loading' | 'error';
export type StatusFilter = 'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'IDENTITY_BLOCKED';

export interface EnterpriseUxAuditGovernanceHubProps {
  initialMode?: ViewStateMode;
  variantLabel?: string;
}

export function EnterpriseUxAuditGovernanceHub({
  initialMode = 'interactive',
  variantLabel = 'A: Split Operations Canvas',
}: EnterpriseUxAuditGovernanceHubProps) {
  const [viewMode, setViewMode] = useState<ViewStateMode>(initialMode);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [records, setRecords] = useState<OperationalRecord[]>(INITIAL_RECORDS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_RECORDS[0]?.id ?? '');
  const [reviewerNote, setReviewerNote] = useState<string>('');
  const [syncReceipt, setSyncReceipt] = useState<string | null>(null);

  const filteredRecords = records.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const activeRecord =
    filteredRecords.find((item) => item.id === selectedId) ?? filteredRecords[0] ?? null;

  function handleDecision(recordId: string, decision: 'APPROVED' | 'REJECTED') {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === recordId
          ? {
              ...item,
              status: decision,
              syncAttempts: decision === 'APPROVED' ? item.syncAttempts + 1 : item.syncAttempts,
            }
          : item
      )
    );
    setSyncReceipt(
      `Revision decision ${decision} recorded for ${recordId} with human verification.`
    );
  }

  function handleRetryOutage() {
    setViewMode('interactive');
    setSyncReceipt(
      'Idempotent retry succeeded (attempt 2/2 -> 50% attempt success, 0 duplicate writes).'
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-4 md:p-8">
      <header
        role="banner"
        className="max-w-7xl mx-auto mb-6 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[10px] p-5 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-xs font-semibold mb-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="#1D4ED8" strokeWidth="2" />
                <path d="M5.5 8L7.2 9.7L10.8 6.3" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>AI Product Design & Digital Transformation · Split Operations Canvas</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0F172A]">
              Auditly Studio — Enterprise AI UX Audit & Design System Governance Hub
            </h1>
            <p className="text-sm text-[#334155] mt-1 max-w-3xl">
              Human-in-the-loop verification workspace ({variantLabel})
            </p>
          </div>

          <nav aria-label="UI state simulation controls" className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] p-1.5 rounded-[6px] border border-[#CBD5E1]">
            {(['interactive', 'empty', 'loading', 'error'] as ViewStateMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] ${
                  viewMode === mode
                    ? 'bg-[#FFFFFF] text-[#0F172A] shadow-sm border border-[#CBD5E1]'
                    : 'text-[#334155] hover:text-[#0F172A]'
                }`}
              >
                State: {mode.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main role="main" className="max-w-7xl mx-auto">
        {syncReceipt && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-3.5 rounded-[10px] bg-[#F0FDF4] border border-[#166534] text-[#166534] text-sm flex items-center justify-between"
          >
            <span>{syncReceipt}</span>
            <button
              type="button"
              onClick={() => setSyncReceipt(null)}
              className="text-xs font-semibold underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {viewMode === 'error' && (
          <section
            role="alert"
            aria-live="assertive"
            className="mb-6 p-5 rounded-[10px] bg-[#FEF2F2] border border-[#991B1B] text-[#991B1B]"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold">
                  Destination Endpoint Outage (HTTP 503 Service Unavailable)
                </h2>
                <p className="text-sm mt-1">
                  Synchronization paused to prevent partial writes. Idempotency key lock is active; retrying will not duplicate records.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetryOutage}
                className="px-4 py-2 rounded-[6px] bg-[#991B1B] text-[#FFFFFF] text-xs font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#991B1B]"
              >
                Retry Idempotent Sync
              </button>
            </div>
          </section>
        )}

        {viewMode === 'loading' && (
          <section
            aria-busy="true"
            aria-label="Loading verification queue"
            className="p-6 rounded-[10px] bg-[#FFFFFF] border border-[#CBD5E1] space-y-4"
          >
            <div className="h-5 w-1/3 bg-[#E2E8F0] rounded mp-auto-pulse" />
            <div className="h-20 w-full bg-[#F1F5F9] rounded-[10px] mp-auto-pulse" />
            <div className="h-20 w-full bg-[#F1F5F9] rounded-[10px] mp-auto-pulse" />
          </section>
        )}

        {viewMode === 'empty' && (
          <section
            aria-label="Empty verification queue"
            className="p-10 text-center rounded-[10px] bg-[#FFFFFF] border border-[#CBD5E1]"
          >
            <h2 className="text-lg font-bold text-[#0F172A]">
              No Records Pending in Current Filter
            </h2>
            <p className="text-sm text-[#334155] mt-1 max-w-md mx-auto">
              All candidate evidence revisions for this filter have been triaged or no exceptions match your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setViewMode('interactive');
              }}
              className="mt-4 px-4 py-2 rounded-[6px] bg-[#1D4ED8] text-[#FFFFFF] text-xs font-semibold hover:bg-[#1E40AF]"
            >
              Reset Filter & Restore Queue
            </button>
          </section>
        )}

        {viewMode === 'interactive' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section
              aria-label="Verification Queue"
              className="lg:col-span-7 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[10px] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#CBD5E1]">
                <h2 className="text-base font-bold text-[#0F172A]">
                  Verification Queue ({filteredRecords.length})
                </h2>
                <div role="group" aria-label="Filter queue by status" className="flex flex-wrap gap-1.5">
                  {(['ALL', 'PENDING_REVIEW', 'APPROVED', 'IDENTITY_BLOCKED'] as StatusFilter[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        aria-pressed={statusFilter === status}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition ${
                          statusFilter === status
                            ? 'bg-[#1D4ED8] text-[#FFFFFF]'
                            : 'bg-[#F1F5F9] text-[#334155] hover:text-[#0F172A]'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {filteredRecords.map((item) => {
                  const isSelected = activeRecord?.id === item.id;
                  const badgeStyle =
                    item.status === 'APPROVED'
                      ? 'bg-[#F0FDF4] text-[#166534] border-[#166534]'
                      : item.status === 'IDENTITY_BLOCKED'
                      ? 'bg-[#FEF2F2] text-[#991B1B] border-[#991B1B]'
                      : 'bg-[#FFFBEB] text-[#92400E] border-[#92400E]';
                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-4 rounded-[10px] border transition cursor-pointer ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-[#EFF6FF]/40'
                          : 'border-[#CBD5E1] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                            {item.id}
                          </span>
                          <h3 className="text-sm font-bold text-[#0F172A]">{item.employeeName}</h3>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeStyle}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#334155] mt-1">{item.employeeRole}</p>
                      <p className="text-sm text-[#0F172A] mt-2">{item.evidenceSummary}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
                        <span className="font-mono">Ref: {item.incidentRef} · Rev: {item.revisionHash}</span>
                        <span>Updated: {item.lastUpdated}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside
              aria-label="Human Review & Inspection Drawer"
              className="lg:col-span-5 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[10px] p-5"
            >
              {activeRecord ? (
                <div>
                  <div className="pb-3 mb-4 border-b border-[#CBD5E1]">
                    <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                      INSPECTING {activeRecord.id} · {activeRecord.revisionHash}
                    </span>
                    <h2 className="text-lg font-bold text-[#0F172A] mt-1">
                      {activeRecord.escoSkillName}
                    </h2>
                    <p className="font-mono text-xs text-[#475569] mt-0.5 break-all">
                      {activeRecord.escoUri}
                    </p>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1]">
                      <dt className="text-xs font-semibold text-[#475569] uppercase">
                        Source Evidence ({activeRecord.incidentRef})
                      </dt>
                      <dd className="text-[#0F172A] mt-1">{activeRecord.evidenceSummary}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1]">
                        <dt className="text-xs font-semibold text-[#475569]">Identity Gate</dt>
                        <dd className="font-mono text-xs font-bold text-[#0F172A] mt-1">
                          {activeRecord.identityStatus}
                        </dd>
                      </div>
                      <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1]">
                        <dt className="text-xs font-semibold text-[#475569]">Sync Attempts</dt>
                        <dd className="font-mono text-xs font-bold text-[#0F172A] mt-1">
                          {activeRecord.syncAttempts}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="mt-4">
                    <label
                      htmlFor="reviewer-rationale-input"
                      className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                    >
                      Reviewer Audit Rationale (Required for Governance Log)
                    </label>
                    <textarea
                      id="reviewer-rationale-input"
                      rows={2}
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      placeholder="Confirm evidence matches ESCO capability criteria..."
                      className="w-full rounded-[6px] border border-[#CBD5E1] p-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      disabled={activeRecord.identityStatus === 'IDENTITY_BLOCKED'}
                      onClick={() => handleDecision(activeRecord.id, 'APPROVED')}
                      className="flex-1 px-4 py-2.5 rounded-[6px] bg-[#1D4ED8] text-[#FFFFFF] text-xs font-semibold hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    >
                      Approve Current Revision
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(activeRecord.id, 'REJECTED')}
                      className="px-4 py-2.5 rounded-[6px] bg-[#FEF2F2] text-[#991B1B] border border-[#991B1B] text-xs font-semibold hover:bg-[#FEE2E2] focus:outline-none focus:ring-2 focus:ring-[#991B1B]"
                    >
                      Reject Suggestion
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#475569]">Select a record to inspect evidence.</p>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
