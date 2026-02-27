'use client';

import { useMemo, useState } from 'react';

type RoleKey = 'student' | 'parent' | 'volunteer' | 'teacher';

const roles: Record<
  RoleKey,
  { label: string; description: string; fields: Array<{ name: string; placeholder: string; type?: string }> }
> = {
  student: {
    label: 'Student',
    description: 'Students from government schools seeking free online classes.',
    fields: [
      { name: 'name', placeholder: 'Name' },
      { name: 'class', placeholder: 'Class (e.g., 7th)' },
      { name: 'school', placeholder: 'School' },
      { name: 'parentMobile', placeholder: 'Parent Mobile', type: 'tel' },
      { name: 'medium', placeholder: 'Medium (English/Hindi/etc.)' },
      { name: 'district', placeholder: 'District' }
    ]
  },
  parent: {
    label: 'Parent',
    description: 'Enroll your child for structured, monitored online learning.',
    fields: [
      { name: 'name', placeholder: 'Your Name' },
      { name: 'childName', placeholder: 'Child Name' },
      { name: 'class', placeholder: 'Class (e.g., 5th)' },
      { name: 'mobile', placeholder: 'Mobile', type: 'tel' },
      { name: 'city', placeholder: 'City' }
    ]
  },
  volunteer: {
    label: 'Volunteer',
    description: 'Teach, mentor, or support operations remotely or onsite.',
    fields: [
      { name: 'skills', placeholder: 'Skills (STEM, languages, ops, design...)' },
      { name: 'availability', placeholder: 'Availability (hours/week, days)' },
      { name: 'location', placeholder: 'Location / Time zone' }
    ]
  },
  teacher: {
    label: 'Teacher',
    description: 'Partner to deliver curriculum-aligned lessons and assessments.',
    fields: [
      { name: 'subjects', placeholder: 'Subjects' },
      { name: 'classes', placeholder: 'Classes you teach' },
      { name: 'experience', placeholder: 'Experience (years, board/curriculum)' },
      { name: 'demo', placeholder: 'Demo lesson link (Drive/YouTube)' }
    ]
  }
};

export default function BecomeMemberPage() {
  const [role, setRole] = useState<RoleKey>('student');
  const [form, setForm] = useState<Record<string, string>>({});
  const current = useMemo(() => roles[role], [role]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send to central sheet/CRM via API endpoint
    console.log('Submit', { role, ...form });
    alert('Thanks! We received your details and will reach out shortly.');
    setForm({});
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
            <input
              key={field.name}
              type={field.type || 'text'}
              required
              placeholder={field.placeholder}
              value={form[field.name] ?? ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          ))}
        </div>
        <button type="submit" className="btn w-full md:w-auto">
          Submit {current.label} form
        </button>
      </form>
    </div>
  );
}
