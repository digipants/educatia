'use client';

import { signIn, signOut } from 'next-auth/react';

export function AdminAuthButton({ action }: { action: 'sign-in' | 'sign-out' }) {
  const isSignIn = action === 'sign-in';
  return (
    <button
      type="button"
      onClick={() => isSignIn
        ? signIn('google', { callbackUrl: '/admin/applications' })
        : signOut({ callbackUrl: '/admin/applications' })}
      className="btn"
    >
      {isSignIn ? 'Continue with Google' : 'Sign out'}
    </button>
  );
}
