'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { getAdminConfiguration, isValidApplicationId, runAsAdministrator } from '@/lib/adminSecurity';
import {
  parseApplicationAssignmentMutation,
  updateApplicationAssignmentAtomically
} from '@/lib/applicationAssignment';
import type { ApplicationRecord } from '@/lib/applicationSubmission';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/server';

function detailPath(id: string | null) {
  return id ? `/admin/applications/${id}` : '/admin/applications';
}

function returnToPage(path: string, result: 'error' | 'stale' | 'not-found'): never {
  redirect(`${path}?assignment=${result}`);
}

export async function updateAdminApplicationAssignment(formData: FormData) {
  const rawId = formData.get('applicationId');
  const validId = typeof rawId === 'string' && isValidApplicationId(rawId) ? rawId : null;
  const path = detailPath(validId);
  const configuration = getAdminConfiguration(process.env);
  const mutation = parseApplicationAssignmentMutation(
    Array.from(formData.entries()),
    configuration.administratorEmails
  );

  if (!configuration.enabled || !mutation || !validId) returnToPage(path, 'error');

  let result;
  try {
    const session = await getServerSession(authOptions);
    result = await runAsAdministrator(configuration, session?.user?.email, async () => {
      const adminEmail = session?.user?.email;
      if (!adminEmail) throw new Error('Unauthorized');
      const collection = (await getDb()).collection<ApplicationRecord>('applications');
      return updateApplicationAssignmentAtomically(collection, mutation, adminEmail.trim().toLowerCase());
    });
  } catch {
    returnToPage(path, 'error');
  }

  if (result.status !== 'ok') returnToPage(path, 'error');
  if (result.value === 'stale' || result.value === 'not-found') returnToPage(path, result.value);

  revalidatePath('/admin/applications');
  revalidatePath(path);
  redirect(`${path}?assignment=saved`);
}
