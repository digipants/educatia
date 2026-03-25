import type { Metadata } from 'next';

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://educatiawelfaretrust.org';

export const siteName = 'Educatia Welfare Trust';
export const defaultTitle =
  'Educatia Welfare Trust | Free Education, Soft Skills and Skill Development';
export const defaultDescription =
  'Educatia Welfare Trust provides free academic support, spoken English, soft skills and practical skill development programs for learners from underserved communities.';
export const socialImageVersion = '20260325';

function withVersion(url: string) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${socialImageVersion}`;
}

function resolveSocialImage(image: string) {
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return withVersion(image);
  }

  const normalized = image.startsWith('/') ? image : `/${image}`;
  return withVersion(`${siteUrl}${normalized}`);
}

export const defaultSocialImage = resolveSocialImage(
  '/images/photo-1629306262232-1f854b4b0b13.webp'
);

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
  const socialImage = resolveSocialImage(image);

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
          url: socialImage,
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
      images: [socialImage]
    }
  };
}
