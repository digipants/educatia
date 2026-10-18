import type { ApplicationRecord } from './applicationSubmission';

export const MAX_APPLICATION_ACTIVITY_ITEMS = 3;

export type ApplicationActivity = {
  id: string;
  kind: 'submitted' | 'status' | 'assignment';
  occurredAt: string;
  actor: string | null;
  message: string;
};

const allowedStatuses = new Set(['New', 'In Review', 'Contacted', 'Closed']);

function validDate(value: unknown) {
  return value instanceof Date && Number.isFinite(value.valueOf()) ? value : null;
}

function currentAllowlistedEmail(value: unknown, administratorEmails: string[]) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return administratorEmails.includes(normalized) ? normalized : null;
}

export function buildApplicationActivity(
  record: ApplicationRecord,
  administratorEmails: string[]
): ApplicationActivity[] {
  const events: ApplicationActivity[] = [];
  const submittedAt = validDate(record.createdAt);
  if (submittedAt) {
    events.push({
      id: 'submitted',
      kind: 'submitted',
      occurredAt: submittedAt.toISOString(),
      actor: null,
      message: 'Application received'
    });
  }

  const statusAt = validDate(record.statusUpdatedAt);
  if (statusAt) {
    const status = typeof record.status === 'string' && allowedStatuses.has(record.status) ? record.status : 'updated';
    events.push({
      id: `status-${record.statusRevision ?? statusAt.toISOString()}`,
      kind: 'status',
      occurredAt: statusAt.toISOString(),
      actor: currentAllowlistedEmail(record.statusUpdatedBy, administratorEmails),
      message: `Latest status: ${status}`
    });
  }

  const assignmentAt = validDate(record.assignedAt);
  if (assignmentAt && record.assignedBy) {
    const assignedTo = currentAllowlistedEmail(record.assignedTo, administratorEmails);
    events.push({
      id: `assignment-${record.assignmentRevision ?? assignmentAt.toISOString()}`,
      kind: 'assignment',
      occurredAt: assignmentAt.toISOString(),
      actor: currentAllowlistedEmail(record.assignedBy, administratorEmails),
      message: assignedTo
        ? `Assigned to ${assignedTo}`
        : record.assignedTo === null
          ? 'Application unassigned'
          : 'Assignment changed'
    });
  }

  return events
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt) || left.id.localeCompare(right.id))
    .slice(0, MAX_APPLICATION_ACTIVITY_ITEMS);
}
