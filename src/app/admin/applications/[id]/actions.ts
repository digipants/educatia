'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { getAdminConfiguration, isValidApplicationId, runAsAdministrator } from '@/lib/adminSecurity';
import { parseApplicationStatusMutation, updateApplicationStatusAtomically } from '@/lib/applicationStatus';
import type { ApplicationRecord } from '@/lib/applicationSubmission';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/server';

function detailPath(id: string | null) {
  return id ? `/admin/applications/${id}` : '/admin/applications';
}

function returnToPage(path: string, result: 'error' | 'stale'): never {
  redirect(`${path}?update=${result}`);
}

export async function updateAdminApplicationStatus(formData: FormData) {
  const rawId = formData.get('applicationId');
  const validId = typeof rawId === 'string' && isValidApplicationId(rawId) ? rawId : null;
  const path = detailPath(validId);
  const mutation = parseApplicationStatusMutation(Array.from(formData.entries()));

  if (!mutation || !validId) returnToPage(path, 'error');

  const configuration = getAdminConfiguration(process.env);
  if (!configuration.enabled) returnToPage(path, 'error');

  let result;
  try {
    const session = await getServerSession(authOptions);
    result = await runAsAdministrator(configuration, session?.user?.email, async () => {
      const adminEmail = session?.user?.email;
      if (!adminEmail) throw new Error('Unauthorized');
      const collection = (await getDb()).collection<ApplicationRecord>('applications');
      return updateApplicationStatusAtomically(collection, mutation, adminEmail.trim().toLowerCase());
    });
  } catch {
    returnToPage(path, 'error');
  }

  if (result.status !== 'ok') returnToPage(path, 'error');
  if (result.value === 'stale') returnToPage(path, 'stale');

  revalidatePath('/admin/applications');
  revalidatePath(path);
  redirect(`${path}?update=saved`);
}
