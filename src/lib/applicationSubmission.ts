import type { ApplicationStatus } from './applicationStatus';

export type FormType = 'Student' | 'Volunteer' | 'Parent' | 'Teacher';
export type FormSource = 'Contact Page' | 'Become a Member';

export type SubmissionPayload = {
  formType: FormType;
  source: FormSource;
  data: Record<string, string>;
};

export type ApplicationRecord = {
  _id: string;
  formType: 'Student' | 'Volunteer';
  source: FormSource;
  data: Record<string, string | boolean>;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  statusUpdatedBy?: string;
  statusUpdatedAt?: Date;
  statusRevision?: string;
  lastStatusMutationId?: string;
  assignedTo?: string | null;
  assignedAt?: Date | null;
  assignedBy?: string;
  assignmentRevision?: string;
  lastAssignmentMutationId?: string;
};

export class SubmissionValidationError extends Error {}
export class IdempotencyConflictError extends Error {}

const emailPattern = /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/;
const phonePattern = /^\+?[0-9\s().-]{7,24}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const inputFields: Record<FormType, readonly string[]> = {
  Student: ['fullName', 'dob', 'gender', 'classOrGrade', 'instituteSchoolUniversity',
    'parentOrGuardianFullName', 'parentOrGuardianContactNo', 'studentWhatsappNo',
    'emailId', 'program', 'parentGuardianConsent'],
  Volunteer: ['fullName', 'dob', 'gender', 'mobile', 'whatsapp', 'email', 'address',
    'serviceOrAreaOfExpertise'],
  Parent: ['fullName', 'studentName', 'interestsOrNeeds'],
  Teacher: ['fullName', 'schoolOrOrganization', 'supportNeed']
};

// Email is durable outside MongoDB. Send the minimum needed for first contact.
const notificationFields: Record<FormType, readonly string[]> = {
  Student: ['fullName', 'classOrGrade', 'instituteSchoolUniversity',
    'parentOrGuardianFullName', 'parentOrGuardianContactNo', 'program', 'parentGuardianConsent'],
  Volunteer: ['fullName', 'mobile', 'whatsapp', 'email', 'serviceOrAreaOfExpertise'],
  Parent: inputFields.Parent,
  Teacher: inputFields.Teacher
};

export function createEmailNotificationPayload(payload: SubmissionPayload): SubmissionPayload {
  const data: Record<string, string> = {};
  for (const field of notificationFields[payload.formType]) {
    const value = payload.data[field];
    if (typeof value === 'string') data[field] = value;
  }
  return { formType: payload.formType, source: payload.source, data };
}

function asTrimmed(data: Record<string, string>, key: string) {
  return data[key]?.trim().replace(/\s+/g, ' ') || '';
}

function validPhone(value: string) {
  return phonePattern.test(value) && value.replace(/\D/g, '').length >= 7;
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value && date <= new Date();
}

function assertRequired(data: Record<string, string>, fields: string[]) {
  if (fields.some((field) => !asTrimmed(data, field))) {
    throw new SubmissionValidationError('Invalid application details');
  }
}

function validateStudent(data: Record<string, string>) {
  assertRequired(data, [
    'fullName',
    'dob',
    'gender',
    'classOrGrade',
    'instituteSchoolUniversity',
    'parentOrGuardianFullName',
    'parentOrGuardianContactNo',
    'studentWhatsappNo',
    'emailId',
    'program',
    'parentGuardianConsent'
  ]);

  if (
    asTrimmed(data, 'fullName').length > 120 ||
    !validDate(asTrimmed(data, 'dob')) ||
    !['Male', 'Female', 'Other'].includes(asTrimmed(data, 'gender')) ||
    asTrimmed(data, 'classOrGrade').length > 60 ||
    asTrimmed(data, 'instituteSchoolUniversity').length > 160 ||
    asTrimmed(data, 'parentOrGuardianFullName').length > 120 ||
    !validPhone(asTrimmed(data, 'parentOrGuardianContactNo')) ||
    !validPhone(asTrimmed(data, 'studentWhatsappNo')) ||
    !emailPattern.test(asTrimmed(data, 'emailId')) ||
    asTrimmed(data, 'emailId').length > 254 ||
    !['Academics', 'Spoken English'].includes(asTrimmed(data, 'program')) ||
    asTrimmed(data, 'parentGuardianConsent') !== 'true'
  ) {
    throw new SubmissionValidationError('Invalid application details');
  }
}

function validateVolunteer(data: Record<string, string>) {
  assertRequired(data, [
    'fullName',
    'dob',
    'gender',
    'mobile',
    'whatsapp',
    'email',
    'address',
    'serviceOrAreaOfExpertise'
  ]);

  if (
    asTrimmed(data, 'fullName').length > 120 ||
    !validDate(asTrimmed(data, 'dob')) ||
    !['Male', 'Female', 'Other'].includes(asTrimmed(data, 'gender')) ||
    !validPhone(asTrimmed(data, 'mobile')) ||
    !validPhone(asTrimmed(data, 'whatsapp')) ||
    !emailPattern.test(asTrimmed(data, 'email')) ||
    asTrimmed(data, 'email').length > 254 ||
    asTrimmed(data, 'address').length > 500 ||
    asTrimmed(data, 'serviceOrAreaOfExpertise').length > 1000
  ) {
    throw new SubmissionValidationError('Invalid application details');
  }
}

export function validateSubmission(input: unknown): SubmissionPayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new SubmissionValidationError('Invalid payload');
  }

  const candidate = input as Record<string, unknown>;
  if (
    typeof candidate.formType !== 'string' ||
    !(['Student', 'Volunteer', 'Parent', 'Teacher'] as string[]).includes(candidate.formType) ||
    typeof candidate.source !== 'string' ||
    !(['Contact Page', 'Become a Member'] as string[]).includes(candidate.source) ||
    (candidate.website !== undefined && (typeof candidate.website !== 'string' || candidate.website.trim().length > 0)) ||
    !candidate.data ||
    typeof candidate.data !== 'object' ||
    Array.isArray(candidate.data)
  ) {
    throw new SubmissionValidationError('Invalid payload');
  }

  const data = candidate.data as Record<string, unknown>;
  const entries = Object.entries(data);
  if (
    entries.length === 0 ||
    entries.length > 25 ||
    entries.some(([key, value]) =>
      !key || key.length > 80 || !inputFields[candidate.formType as FormType].includes(key) ||
      typeof value !== 'string' || value.length > 2000 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)
    )
  ) {
    throw new SubmissionValidationError('Invalid payload');
  }

  const payload: SubmissionPayload = {
    formType: candidate.formType as FormType,
    source: candidate.source as FormSource,
    data: data as Record<string, string>
  };

  if (payload.formType === 'Student') validateStudent(payload.data);
  if (payload.formType === 'Volunteer') validateVolunteer(payload.data);

  return payload;
}

export function createApplicationRecord(
  payload: SubmissionPayload,
  idempotencyKey: string,
  now = new Date()
): ApplicationRecord {
  if (payload.formType !== 'Student' && payload.formType !== 'Volunteer') {
    throw new SubmissionValidationError('Invalid application type');
  }
  if (!uuidPattern.test(idempotencyKey)) {
    throw new SubmissionValidationError('Invalid application request');
  }

  const { data } = payload;
  let storedData: Record<string, string | boolean>;
  if (payload.formType === 'Student') {
    storedData = {
        fullName: asTrimmed(data, 'fullName'),
        classOrGrade: asTrimmed(data, 'classOrGrade'),
        instituteSchoolUniversity: asTrimmed(data, 'instituteSchoolUniversity'),
        parentOrGuardianFullName: asTrimmed(data, 'parentOrGuardianFullName'),
        parentOrGuardianContactNo: asTrimmed(data, 'parentOrGuardianContactNo').replace(/[\s().-]/g, ''),
        program: asTrimmed(data, 'program'),
        parentGuardianConsent: true
    };
  } else {
    storedData = {
        fullName: asTrimmed(data, 'fullName'),
        mobile: asTrimmed(data, 'mobile').replace(/[\s().-]/g, ''),
        whatsapp: asTrimmed(data, 'whatsapp').replace(/[\s().-]/g, ''),
        email: asTrimmed(data, 'email').toLowerCase(),
        serviceOrAreaOfExpertise: asTrimmed(data, 'serviceOrAreaOfExpertise')
    };
  }

  return {
    _id: idempotencyKey,
    formType: payload.formType,
    source: payload.source,
    data: storedData,
    status: 'New',
    createdAt: now,
    updatedAt: now
  };
}

type ApplicationCollection = {
  insertOne: (application: ApplicationRecord) => Promise<unknown>;
  findOne: (filter: { _id: string }) => Promise<ApplicationRecord | null>;
};

export async function insertApplicationOnce(
  collection: ApplicationCollection,
  application: ApplicationRecord
) {
  try {
    await collection.insertOne(application);
    return true;
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;

    const existing = await collection.findOne({ _id: application._id });
    if (!existing) throw error;

    const sameApplication =
      existing.formType === application.formType &&
      existing.source === application.source &&
      JSON.stringify(existing.data) === JSON.stringify(application.data);

    if (!sameApplication) throw new IdempotencyConflictError();
    return false;
  }
}

type SubmissionDependencies = {
  storageEnabled: boolean;
  idempotencyKey: string | null;
  saveApplication: (application: ApplicationRecord) => Promise<boolean>;
  sendEmail: (payload: SubmissionPayload) => Promise<void>;
  now?: Date;
};

export async function processSubmission(input: unknown, dependencies: SubmissionDependencies) {
  const payload = validateSubmission(input);
  const isApplication = payload.formType === 'Student' || payload.formType === 'Volunteer';
  const notification = createEmailNotificationPayload(payload);

  if (dependencies.storageEnabled && isApplication) {
    if (!dependencies.idempotencyKey) {
      throw new SubmissionValidationError('Invalid application request');
    }

    const application = createApplicationRecord(payload, dependencies.idempotencyKey, dependencies.now);
    const inserted = await dependencies.saveApplication(application);

    if (inserted) {
      try {
        await dependencies.sendEmail(notification);
      } catch {
        // The durable application is authoritative; email is only a notification.
      }
    }

    return { persisted: true, duplicate: !inserted };
  }

  await dependencies.sendEmail(notification);
  return { persisted: false, duplicate: false };
}
