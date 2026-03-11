'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/formSubmission';

export default function StudentForm() {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus('');
      await submitForm({
        source: 'Contact Page',
        formType: 'Student',
        data: {
          name,
          gradeOrCollege: grade
        }
      });
      setStatus('Submitted successfully. We will contact you shortly.');
      setName('');
      setGrade('');
    } catch (error: any) {
      setStatus(error?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="text-lg font-semibold">Student</h3>
      <input
        required
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        placeholder="Grade / College"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
