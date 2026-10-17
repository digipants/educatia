import 'server-only';
import { getServerSession } from 'next-auth';
import type { ApplicationRecord } from './applicationSubmission';
import { isApplicationStatus, type ApplicationStatus } from './applicationStatus';
import {
  APPLICATION_ASSIGNMENT_DETAIL_PROJECTION,
  APPLICATION_ASSIGNMENT_SUMMARY_PROJECTION,
  currentAllowlistedAssignee
} from './applicationAssignment';
import { getAdminConfiguration, isValidApplicationId, parseApplicationPagination, readAsAdministrator } from './adminSecurity';
import { authOptions } from './auth';
import { getDb } from './server';

export type ApplicationSummary = {
  id: string;
  formType: 'Student' | 'Volunteer';
  name: string;
  submittedAt: string | null;
  source: string;
  status: ApplicationStatus | 'Unknown';
  assignedTo: string | null;
};

export type ApplicationDetail = ApplicationSummary & {
  revision: string | null;
  assignmentRevision: string | null;
  assignedAt: string | null;
  assignedBy: string | null;
  assigneeOptions: string[];
  fields: Array<{ label: string; value: string }>;
};

const statusRevisionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dateValue(value: Date) {
  return value instanceof Date && Number.isFinite(value.valueOf()) ? value.toISOString() : null;
}

function summary(record: ApplicationRecord, administratorEmails: string[]): ApplicationSummary {
  return {
    id: record._id,
    formType: record.formType,
    name: typeof record.data.fullName === 'string' ? record.data.fullName.slice(0, 120) : 'Unnamed application',
    submittedAt: dateValue(record.createdAt),
    source: record.source === 'Contact Page' || record.source === 'Become a Member' ? record.source : 'Unknown',
    status: isApplicationStatus(record.status) ? record.status : 'Unknown',
    assignedTo: currentAllowlistedAssignee(record.assignedTo, administratorEmails)
  };
}

const studentFields = [
  ['fullName', 'Full name'],
  ['classOrGrade', 'Class / grade'],
  ['instituteSchoolUniversity', 'School / institute'],
  ['parentOrGuardianFullName', 'Parent / guardian'],
  ['parentOrGuardianContactNo', 'Parent / guardian contact'],
  ['program', 'Program'],
  ['parentGuardianConsent', 'Guardian consent']
] as const;

const volunteerFields = [
  ['fullName', 'Full name'],
  ['mobile', 'Mobile'],
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['serviceOrAreaOfExpertise', 'Service / expertise']
] as const;

function details(record: ApplicationRecord, administratorEmails: string[]): ApplicationDetail {
  const allowedFields = record.formType === 'Student' ? studentFields : volunteerFields;
  const fields = allowedFields.flatMap(([key, label]) => {
    const value = record.data[key];
    if (typeof value === 'string') return [{ label, value: value.slice(0, 2000) }];
    if (typeof value === 'boolean' && key === 'parentGuardianConsent') {
      return [{ label, value: value ? 'Yes' : 'No' }];
    }
    return [];
  });
  const revision = record.statusRevision === undefined
    ? dateValue(record.updatedAt)
    : typeof record.statusRevision === 'string' && statusRevisionPattern.test(record.statusRevision)
      ? record.statusRevision
      : null;
  const assignmentRevision = typeof record.assignmentRevision === 'string' && statusRevisionPattern.test(record.assignmentRevision)
    ? record.assignmentRevision
    : null;
  return {
    ...summary(record, administratorEmails),
    revision,
    assignmentRevision,
    assignedAt: record.assignedAt instanceof Date ? dateValue(record.assignedAt) : null,
    assignedBy: typeof record.assignedBy === 'string' ? record.assignedBy.slice(0, 254) : null,
    assigneeOptions: administratorEmails,
    fields
  };
}

async function withAdminRead<T>(read: (administratorEmails: string[]) => Promise<T>) {
  const configuration = getAdminConfiguration(process.env);
  if (!configuration.enabled) return { status: 'unavailable' } as const;

  try {
    const session = await getServerSession(authOptions);
    return await readAsAdministrator(configuration, session?.user?.email, () => read(configuration.administratorEmails));
  } catch {
    return { status: 'error' } as const;
  }
}

export async function listAdminApplications(searchParams: {
  page?: string | string[];
  limit?: string | string[];
}) {
  return withAdminRead(async (administratorEmails) => {
    const pagination = parseApplicationPagination(searchParams);
    if (!pagination) return { kind: 'invalid-pagination' as const };

    const collection = (await getDb()).collection<ApplicationRecord>('applications');
    const projection = {
      _id: 1,
      formType: 1,
      source: 1,
      status: 1,
      createdAt: 1,
      'data.fullName': 1,
      ...APPLICATION_ASSIGNMENT_SUMMARY_PROJECTION
    };
    const [records, total] = await Promise.all([
      collection.find({ formType: { $in: ['Student', 'Volunteer'] } }, { projection })
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .toArray(),
      collection.countDocuments({ formType: { $in: ['Student', 'Volunteer'] } })
    ]);

    return {
      kind: 'data' as const,
      items: records.map((record) => summary(record, administratorEmails)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      pageCount: Math.max(1, Math.ceil(total / pagination.limit))
    };
  });
}

export async function getAdminApplication(id: string) {
  return withAdminRead(async (administratorEmails) => {
    if (!isValidApplicationId(id)) return { kind: 'invalid-id' as const };

    const collection = (await getDb()).collection<ApplicationRecord>('applications');
    const projection = {
      _id: 1,
      formType: 1,
      source: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      statusRevision: 1,
      ...APPLICATION_ASSIGNMENT_DETAIL_PROJECTION,
      'data.fullName': 1,
      'data.classOrGrade': 1,
      'data.instituteSchoolUniversity': 1,
      'data.parentOrGuardianFullName': 1,
      'data.parentOrGuardianContactNo': 1,
      'data.program': 1,
      'data.parentGuardianConsent': 1,
      'data.mobile': 1,
      'data.whatsapp': 1,
      'data.email': 1,
      'data.serviceOrAreaOfExpertise': 1
    };
    const record = await collection.findOne(
      { _id: id, formType: { $in: ['Student', 'Volunteer'] } },
      { projection }
    );
    return {
      kind: 'data' as const,
      application: record ? details(record, administratorEmails) : null
    };
  });
}
