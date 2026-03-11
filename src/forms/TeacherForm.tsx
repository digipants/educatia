'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/formSubmission';

export default function TeacherForm() {
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [supportNeed, setSupportNeed] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus('');
      await submitForm({
        source: 'Contact Page',
        formType: 'Teacher',
        data: {
          fullName,
          schoolOrOrganization: organization,
          supportNeed
        }
      });
      setStatus('Submitted successfully. We will contact you shortly.');
      setFullName('');
      setOrganization('');
      setSupportNeed('');
    } catch (error: any) {
      setStatus(error?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="text-lg font-semibold">Teacher</h3>
      <input
        required
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        placeholder="School / Organization"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <textarea
        required
        placeholder="How can we support your classroom?"
        value={supportNeed}
        onChange={(e) => setSupportNeed(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
        rows={3}
      />
      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
