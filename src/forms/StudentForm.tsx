'use client';

import { useState } from 'react';

export default function StudentForm() {
  const [name, setName] = useState('');

  return (
    <form className="card space-y-3">
      <h3 className="text-lg font-semibold">Student</h3>
      <input
        required
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input placeholder="Grade / College" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <button type="submit" className="btn w-full">Submit</button>
    </form>
  );
}
