import 'server-only';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getAdminConfiguration, isVerifiedGoogleAdministrator } from './adminSecurity';
import { getCmsConfiguration, isVerifiedGoogleCmsStaff } from './cmsSecurity';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== 'google') return false;
      const configuration = getAdminConfiguration(process.env);
      const googleProfile = profile as { email?: unknown; email_verified?: unknown } | undefined;
      const applicationAdmin = configuration.enabled && isVerifiedGoogleAdministrator(
        googleProfile?.email,
        googleProfile?.email_verified,
        user.email,
        configuration.administratorEmails
      );
      const cms = getCmsConfiguration(process.env);
      const cmsStaff = cms.enabled && isVerifiedGoogleCmsStaff(
        googleProfile?.email,
        googleProfile?.email_verified,
        user.email,
        cms
      );
      return applicationAdmin || cmsStaff;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = typeof token.email === 'string' ? token.email : null;
        session.user.name = null;
        session.user.image = null;
      }
      return session;
    }
  }
};
