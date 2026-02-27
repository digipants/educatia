'use client';

export default function TeacherForm() {
  return (
    <form className="card space-y-3">
      <h3 className="text-lg font-semibold">Teacher</h3>
      <input placeholder="Full name" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <input placeholder="School / Organization" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <textarea placeholder="How can we support your classroom?" className="w-full rounded-md border border-slate-200 px-3 py-2" rows={3} />
      <button type="submit" className="btn w-full">Submit</button>
    </form>
  );
}
