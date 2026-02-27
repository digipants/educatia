'use client';

export default function VolunteerForm() {
  return (
    <form className="card space-y-3">
      <h3 className="text-lg font-semibold">Volunteer</h3>
      <input placeholder="Full name" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <input placeholder="Email" className="w-full rounded-md border border-slate-200 px-3 py-2" />
      <textarea placeholder="Skills & availability" className="w-full rounded-md border border-slate-200 px-3 py-2" rows={3} />
      <button type="submit" className="btn w-full">Submit</button>
    </form>
  );
}
