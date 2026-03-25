import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import {
  academicsSubcategories,
  skillDevelopmentSubcategories,
  softSkillsSubcategories
} from '@/lib/programSubcategories';

const staticRoutes = [
  '',
  '/about',
  '/academics',
  '/become-a-member',
  '/contact',
  '/donate',
  '/donation-campaign',
  '/gallery',
  '/news-updates',
  '/privacy-policy',
  '/programs',
  '/skill-development',
  '/soft-skills'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route || '/'}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7
  })) satisfies MetadataRoute.Sitemap;

  const dynamicEntries = [
    ...academicsSubcategories.map((item) => ({
      url: `${siteUrl}/academics/${item.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...softSkillsSubcategories.map((item) => ({
      url: `${siteUrl}/soft-skills/${item.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...skillDevelopmentSubcategories.map((item) => ({
      url: `${siteUrl}/skill-development/${item.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];

  return [...staticEntries, ...dynamicEntries];
}
