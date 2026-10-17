import 'server-only';
import { getDb } from './server';
import { insertApplicationOnce, type ApplicationRecord } from './applicationSubmission';

export async function saveApplication(application: ApplicationRecord) {
  const collection = (await getDb()).collection<ApplicationRecord>('applications', {
    writeConcern: { w: 'majority', j: true }
  });
  return insertApplicationOnce(collection, application);
}
