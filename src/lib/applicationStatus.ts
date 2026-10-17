import { randomUUID } from 'node:crypto';
import type { Collection } from 'mongodb';
import type { ApplicationRecord } from './applicationSubmission';

export const APPLICATION_STATUSES = ['New', 'In Review', 'Contacted', 'Closed'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationStatusMutation = {
  applicationId: string;
  expectedStatus: ApplicationStatus;
  expectedRevision: string;
  mutationId: string;
  status: ApplicationStatus;
};

const applicationIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const formKeys = new Set(['applicationId', 'expectedStatus', 'expectedRevision', 'mutationId', 'status']);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isUuid(value: string) {
  return applicationIdPattern.test(value);
}

function isLegacyRevision(value: string) {
  if (!isoDatePattern.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString() === value;
}

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export function parseApplicationStatusMutation(
  entries: Array<[string, unknown]>
): ApplicationStatusMutation | null {
  const values: Record<string, string> = {};

  for (const [key, value] of entries) {
    if (key.startsWith('$ACTION_')) continue;
    if (!formKeys.has(key) || typeof value !== 'string' || Object.hasOwn(values, key)) return null;
    values[key] = value;
  }

  if (
    Object.keys(values).length !== formKeys.size ||
    values.applicationId.length !== 36 ||
    !isUuid(values.applicationId) ||
    values.expectedStatus.length > 10 ||
    values.status.length > 10 ||
    !isApplicationStatus(values.expectedStatus) ||
    !isApplicationStatus(values.status) ||
    !(isUuid(values.expectedRevision) || isLegacyRevision(values.expectedRevision)) ||
    values.mutationId.length !== 36 ||
    !isUuid(values.mutationId)
  ) {
    return null;
  }

  return {
    applicationId: values.applicationId,
    expectedStatus: values.expectedStatus,
    expectedRevision: values.expectedRevision,
    mutationId: values.mutationId,
    status: values.status
  };
}

export type StatusUpdateOutcome = 'updated' | 'unchanged' | 'stale';

type StatusCollection = Pick<Collection<ApplicationRecord>, 'findOne' | 'updateOne'>;

function revisionFilter(revision: string) {
  return isUuid(revision)
    ? { statusRevision: revision }
    : { updatedAt: new Date(revision), statusRevision: { $exists: false as const } };
}

export async function updateApplicationStatusAtomically(
  collection: StatusCollection,
  mutation: ApplicationStatusMutation,
  updatedBy: string,
  now = new Date()
): Promise<StatusUpdateOutcome> {
  const applicationFilter = {
    _id: mutation.applicationId,
    formType: { $in: ['Student', 'Volunteer'] as const }
  };

  if (mutation.expectedStatus === mutation.status) {
    const current = await collection.findOne(applicationFilter, {
      projection: { status: 1, updatedAt: 1, statusRevision: 1 }
    });
    const sameRevision = current?.statusRevision === mutation.expectedRevision || (
      !current?.statusRevision &&
      current?.updatedAt instanceof Date &&
      current.updatedAt.toISOString() === mutation.expectedRevision
    );
    return current?.status === mutation.status && sameRevision ? 'unchanged' : 'stale';
  }

  const nextRevision = randomUUID();
  const result = await collection.updateOne(
    {
      ...applicationFilter,
      status: mutation.expectedStatus,
      ...revisionFilter(mutation.expectedRevision)
    },
    {
      $set: {
        status: mutation.status,
        updatedAt: now,
        statusUpdatedAt: now,
        statusUpdatedBy: updatedBy,
        statusRevision: nextRevision,
        lastStatusMutationId: mutation.mutationId
      }
    }
  );

  if (result.matchedCount === 1) return 'updated';

  const current = await collection.findOne(applicationFilter, {
    projection: { status: 1, lastStatusMutationId: 1 }
  });
  return current?.status === mutation.status && current.lastStatusMutationId === mutation.mutationId
    ? 'unchanged'
    : 'stale';
}
