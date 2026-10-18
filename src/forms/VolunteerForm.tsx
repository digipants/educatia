'use client';

import { useState } from 'react';
import { submitForm } from '@/lib/formSubmission';

export default function VolunteerForm() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [expertise, setExpertise] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus('');
      await submitForm({
        source: 'Contact Page',
        formType: 'Volunteer',
        data: {
          fullName,
          dob,
          gender,
          mobile,
          whatsapp,
          email,
          address,
          serviceOrAreaOfExpertise: expertise
        }
      });
      setStatus('Submitted successfully. We will contact you shortly.');
      setFullName('');
      setDob('');
      setGender('');
      setMobile('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setExpertise('');
    } catch (error: any) {
      setStatus(error?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="card space-y-3">
      <h3 className="text-lg font-semibold">Volunteer</h3>
      <input
        required
        aria-label="Full Name"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        aria-label="Date of birth"
        required
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <select
        aria-label="Gender"
        required
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 bg-gray-200"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input
        required
        type="tel"
        aria-label="Mobile"
        placeholder="Mobile"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="tel"
        aria-label="Whatsapp"
        placeholder="Whatsapp"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <input
        required
        type="email"
        aria-label="Email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
      />
      <textarea
        required
        aria-label="Address"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2"
        rows={3}
      />
      <textarea
        required
        aria-label="Service Which You Can Offer / Area of Expertise"
        placeholder="Service Which You Can Offer / Area of Expertise"
        value={expertise}
        onChange={(e) => setExpertise(e.target.value)}
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
