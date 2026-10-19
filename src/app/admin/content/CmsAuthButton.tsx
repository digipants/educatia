'use client';

import { signIn, signOut } from 'next-auth/react';

export function CmsAuthButton({ action }: { action: 'sign-in' | 'sign-out' }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={() => action === 'sign-in'
        ? signIn('google', { callbackUrl: '/admin/content' })
        : signOut({ callbackUrl: '/admin/content' })}
    >
      {action === 'sign-in' ? 'Continue with Google' : 'Sign out'}
    </button>
  );
}
