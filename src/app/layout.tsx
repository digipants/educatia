import '../styles/globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialBar from '@/components/SocialBar';
import {
  defaultDescription,
  defaultSocialImage,
  defaultTitle,
  siteName,
  siteUrl
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  applicationName: siteName,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Educatia Welfare Trust',
    'free education',
    'Class 9 to 12 support',
    'spoken English classes',
    'soft skills training',
    'skill development programs',
    'nonprofit education India'
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: 'education',
  alternates: {
    canonical: '/'
  },
  icons: {
    icon: '/images/fav.ico',
    shortcut: '/images/fav.ico',
    apple: '/images/fav.ico'
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: defaultSocialImage,
        width: 1200,
        height: 630,
        alt: defaultTitle
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultSocialImage]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <SocialBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
