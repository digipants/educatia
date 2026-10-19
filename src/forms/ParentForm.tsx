'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/formSubmission';
import { SpamTrapField, readSpamTrap } from '@/components/SpamTrapField';

export default function ParentForm() {
  const [fullName, setFullName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spamTrap = readSpamTrap(e.currentTarget as HTMLFormElement);
    try {
      setLoading(true);
      setStatus('');
      await submitForm({
        source: 'Contact Page',
        formType: 'Parent',
        data: {
          fullName,
          studentName,
          interestsOrNeeds: notes
        }
      }, spamTrap);
      setStatus('Submitted successfully. We will contact you shortly.');
      setFullName('');
      setStudentName('');
      setNotes('');
    } catch (error: any) {
      setStatus(error?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="card space-y-3">
      <SpamTrapField />
      <h3 className="text-lg font-semibold">Parent</h3>
      <input
        required
        aria-label="Full name"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        aria-label="Student name"
        placeholder="Student name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <textarea
        required
        aria-label="Interests / needs"
        placeholder="Interests / needs"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
        rows={3}
      />
      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {status ? <p role="status" aria-live="polite" className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
