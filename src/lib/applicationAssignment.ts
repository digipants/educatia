import { randomUUID } from 'node:crypto';
import type { Collection } from 'mongodb';
import type { ApplicationRecord } from './applicationSubmission';

export type ApplicationAssignmentMutation = {
  applicationId: string;
  expectedRevision: string;
  mutationId: string;
  assignedTo: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const formKeys = new Set(['applicationId', 'expectedAssignmentRevision', 'mutationId', 'assignedTo']);

function isConfiguredAdministrator(email: string, administratorEmails: string[]) {
  return administratorEmails.includes(email);
}
export function currentAllowlistedAssignee(value: unknown, administratorEmails: string[]) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return administratorEmails.includes(normalized) ? normalized : null;
}

export const APPLICATION_ASSIGNMENT_SUMMARY_PROJECTION = { assignedTo: 1 } as const;
export const APPLICATION_ASSIGNMENT_DETAIL_PROJECTION = {
  assignedTo: 1,
  assignedAt: 1,
  assignedBy: 1,
  assignmentRevision: 1
} as const;

export function parseApplicationAssignmentMutation(
  entries: Array<[string, unknown]>,
  administratorEmails: string[]
): ApplicationAssignmentMutation | null {
  const values: Record<string, string> = {};

  for (const [key, value] of entries) {
    if (key.startsWith('$ACTION_')) continue;
    if (!formKeys.has(key) || typeof value !== 'string' || Object.hasOwn(values, key)) return null;
    values[key] = value;
  }

  if (
    Object.keys(values).length !== formKeys.size ||
    !uuidPattern.test(values.applicationId) ||
    !(values.expectedAssignmentRevision === '' || uuidPattern.test(values.expectedAssignmentRevision)) ||
    !uuidPattern.test(values.mutationId) ||
    !(values.assignedTo === '' || isConfiguredAdministrator(values.assignedTo, administratorEmails))
  ) {
    return null;
  }

  return {
    applicationId: values.applicationId,
    expectedRevision: values.expectedAssignmentRevision,
    mutationId: values.mutationId,
    assignedTo: values.assignedTo || null
  };
}

export type AssignmentUpdateOutcome = 'updated' | 'unchanged' | 'stale' | 'not-found';

type AssignmentCollection = Pick<Collection<ApplicationRecord>, 'findOne' | 'updateOne'>;

function revisionFilter(revision: string) {
  return revision ? { assignmentRevision: revision } : {
    assignmentRevision: { $exists: false as const },
    assignedTo: { $exists: false as const }
  };
}

function currentRevisionMatches(record: ApplicationRecord | null, revision: string) {
  return revision
    ? record?.assignmentRevision === revision
    : !record?.assignmentRevision && record?.assignedTo === undefined;
}

export async function updateApplicationAssignmentAtomically(
  collection: AssignmentCollection,
  mutation: ApplicationAssignmentMutation,
  assignedBy: string,
  now = new Date()
): Promise<AssignmentUpdateOutcome> {
  const applicationFilter = {
    _id: mutation.applicationId,
    formType: { $in: ['Student', 'Volunteer'] as const }
  };

  const current = await collection.findOne(applicationFilter, {
    projection: { assignedTo: 1, assignmentRevision: 1, lastAssignmentMutationId: 1 }
  });
  if (!current) return 'not-found';
  const currentAssignee = typeof current.assignedTo === 'string' ? current.assignedTo : null;
  if (current.lastAssignmentMutationId === mutation.mutationId) {
    return currentAssignee === mutation.assignedTo ? 'unchanged' : 'stale';
  }
  if (!currentRevisionMatches(current, mutation.expectedRevision)) return 'stale';
  if (currentAssignee === mutation.assignedTo) return 'unchanged';

  const nextRevision = randomUUID();
  const result = await collection.updateOne(
    { ...applicationFilter, ...revisionFilter(mutation.expectedRevision) },
    {
      $set: {
        assignedTo: mutation.assignedTo,
        assignedAt: now,
        assignedBy,
        assignmentRevision: nextRevision,
        lastAssignmentMutationId: mutation.mutationId
      }
    }
  );

  if (result.matchedCount === 1) return 'updated';

  const afterUpdate = await collection.findOne(applicationFilter, {
    projection: { assignmentRevision: 1, lastAssignmentMutationId: 1 }
  });
  if (!afterUpdate) return 'not-found';
  return afterUpdate.lastAssignmentMutationId === mutation.mutationId ? 'unchanged' : 'stale';
}
