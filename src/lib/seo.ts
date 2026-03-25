import type { Metadata } from 'next';

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://educatiawelfaretrust.org';

export const siteName = 'Educatia Welfare Trust';
export const defaultTitle =
  'Educatia Welfare Trust | Free Education, Soft Skills and Skill Development';
export const defaultDescription =
  'Educatia Welfare Trust provides free academic support, spoken English, soft skills and practical skill development programs for learners from underserved communities.';
export const defaultSocialImage = `${siteUrl}/images/photo-1629306262232-1f854b4b0b13.webp`;

export function createPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  image = defaultSocialImage
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords: [
      'Educatia Welfare Trust',
      'free education',
      'student support',
      'soft skills',
      'skill development',
      'spoken English',
      ...keywords
    ],
    alternates: {
      canonical: path
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  };
}
