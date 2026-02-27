'use client';

export default function ParentForm() {
  return (
    <form className="card space-y-3">
      <h3 className="text-lg font-semibold">Parent</h3>
      <input placeholder="Full name" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <input placeholder="Student name" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <textarea placeholder="Interests / needs" className="w-full rounded-md border border-slate-200 px-3 py-2" rows={3} />
      <button type="submit" className="btn w-full">Submit</button>
    </form>
  );
}
