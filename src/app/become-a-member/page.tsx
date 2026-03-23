'use client';

import { useMemo, useState } from 'react';
import { submitForm } from '@/lib/formSubmission';

type RoleKey = 'student' | 'volunteer';
type RoleField = {
  name: string;
  placeholder: string;
  type?: string;
  options?: string[];
};

const roles: Record<
  RoleKey,
  { label: string; description: string; fields: RoleField[] }
> = {
  student: {
    label: 'Student',
    description: 'Students from government schools seeking free online classes.',
    fields: [
      { name: 'fullName', placeholder: 'Full Name' },
      { name: 'dob', placeholder: 'DOB', type: 'date' },
      { name: 'gender', placeholder: 'Gender', options: ['Male', 'Female', 'Other'] },
      { name: 'classOrGrade', placeholder: 'Class / Grade Currently Studying In' },
      { name: 'parentOrGuardianFullName', placeholder: 'Parent / Guardian Full Name' },
      { name: 'parentOrGuardianContactNo', placeholder: 'Parent / Guardian Contact No', type: 'tel' },
      { name: 'studentWhatsappNo', placeholder: 'Whatsapp No. of Student', type: 'tel' },
      { name: 'emailId', placeholder: 'Email ID', type: 'email' },
      { name: 'program', placeholder: 'Program', options: ['Academics', 'Spoken English'] }
    ]
  },
  volunteer: {
    label: 'Volunteer',
    description: 'Teach, mentor, or support operations remotely or onsite.',
    fields: [
      { name: 'fullName', placeholder: 'Full Name' },
      { name: 'dob', placeholder: 'DOB', type: 'date' },
      { name: 'gender', placeholder: 'Gender', options: ['Male', 'Female', 'Other'] },
      { name: 'mobile', placeholder: 'Mobile', type: 'tel' },
      { name: 'whatsapp', placeholder: 'Whatsapp', type: 'tel' },
      { name: 'email', placeholder: 'Email', type: 'email' },
      { name: 'address', placeholder: 'Address' },
      { name: 'serviceOrAreaOfExpertise', placeholder: 'Service Which You Can Offer / Area of Expertise' }
    ]
  }
};

export default function BecomeMemberPage() {
  const [role, setRole] = useState<RoleKey>('student');
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const current = useMemo(() => roles[role], [role]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus('');
      await submitForm({
        source: 'Become a Member',
        formType: roles[role].label,
        data: form
      });
      setStatus('Submitted successfully. We will contact you shortly.');
      setForm({});
    } catch (error: any) {
      setStatus(error?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Become a Member</h1>
        <p className="text-slate-700">
          Choose the role that fits you best. All submissions feed into our central CRM for quick follow-up.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {(Object.keys(roles) as RoleKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setRole(key)}
            className={`card text-left space-y-1 transition ${
              role === key ? 'ring-2 ring-brand-primary shadow' : 'hover:shadow'
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">{roles[key].label}</p>
            <p className="text-xs text-slate-600">{roles[key].description}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{current.label} details</p>
          <p className="text-xs text-slate-600">Required fields to process your application.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {current.fields.map((field) => (
            field.options ? (
              <select
                key={field.name}
                required
                value={form[field.name] ?? ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                type={field.type || 'text'}
                required
                placeholder={field.placeholder}
                value={form[field.name] ?? ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            )
          ))}
        </div>
        <button type="submit" className="btn w-full md:w-auto" disabled={loading}>
          {loading ? 'Submitting...' : `Submit ${current.label} form`}
        </button>
        {status ? <p className="text-xs text-slate-600">{status}</p> : null}
      </form>
    </div>
  );
}
