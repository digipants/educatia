import Link from 'next/link';
import { CmsAuthButton } from './CmsAuthButton';

type CmsAccessStatus =
  | 'unavailable'
  | 'unauthenticated'
  | 'unauthorized'
  | 'error'
  | 'not-found';

/**
 * Keep an exit route available even if a CMS MongoDB query or account
 * authorization fails. Do not require content to load before sign-out.
 */
export function CmsAccessActions({ status }: { status: CmsAccessStatus }) {
  if (status === 'unauthenticated') {
    return <CmsAuthButton action="sign-in" />;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/admin/content"
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      >
        Retry workspace
      </Link>
      <CmsAuthButton action="sign-out" />
    </div>
  );
}
