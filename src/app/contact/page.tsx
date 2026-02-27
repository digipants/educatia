import StudentForm from '@/forms/StudentForm';
import VolunteerForm from '@/forms/VolunteerForm';
import TeacherForm from '@/forms/TeacherForm';
import ParentForm from '@/forms/ParentForm';

export default function ContactPage() {
  return (
    <div className="container py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Contact & Join</h1>
        <p className="text-slate-700">Tell us how you want to contribute. Pick the form that fits you best.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <StudentForm />
        <VolunteerForm />
        <TeacherForm />
        <ParentForm />
      </div>
    </div>
  );
}
