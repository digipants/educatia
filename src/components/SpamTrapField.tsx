// Deliberately hidden from legitimate users and assistive technology.
// A filled decoy is rejected server-side before sending an email or storing data.
export function SpamTrapField() {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website (leave this empty)
        <input type="text" name="website" autoComplete="off" tabIndex={-1} />
      </label>
    </div>
  );
}

export function readSpamTrap(form: HTMLFormElement): string {
  return (form.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';
}
