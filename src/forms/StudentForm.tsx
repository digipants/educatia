'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/formSubmission';

export default function StudentForm() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [grade, setGrade] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [studentWhatsapp, setStudentWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('');
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
          fullName,
          dob,
          gender,
          classOrGrade: grade,
          parentOrGuardianFullName: parentName,
          parentOrGuardianContactNo: parentContact,
          studentWhatsappNo: studentWhatsapp,
          emailId: email,
          program
        }
      });
      setStatus('Submitted successfully. We will contact you shortly.');
      setFullName('');
      setDob('');
      setGender('');
      setGrade('');
      setParentName('');
      setParentContact('');
      setStudentWhatsapp('');
      setEmail('');
      setProgram('');
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
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <select
        required
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input
        required
        placeholder="Class / Grade Currently Studying In"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        placeholder="Parent / Guardian Full Name"
        value={parentName}
        onChange={(e) => setParentName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="tel"
        placeholder="Parent / Guardian Contact No"
        value={parentContact}
        onChange={(e) => setParentContact(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="tel"
        placeholder="Whatsapp No. of Student"
        value={studentWhatsapp}
        onChange={(e) => setStudentWhatsapp(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="email"
        placeholder="Email ID"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <select
        required
        value={program}
        onChange={(e) => setProgram(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      >
        <option value="">Select Program</option>
        <option value="Academics">Academics</option>
        <option value="Spoken English">Spoken English</option>
      </select>
      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </form>
  );
}
