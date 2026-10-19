type Environment = Readonly<Record<string, string | undefined>>;

export type CmsGalleryConfiguration = {
  enabled: boolean;
  publishingEnabled: boolean;
  minorPublishingEnabled: boolean;
  storageRegion: 'us-east-1' | 'us-east-2' | 'eu-central-1' | 'ap-southeast-1' | 'ap-southeast-2' | null;
};

export function getCmsGalleryConfiguration(env: Environment): CmsGalleryConfiguration {
  const configuredRegion = env.CMS_MEDIA_STORAGE_REGION;
  const storageRegion = configuredRegion === 'us-east-1' || configuredRegion === 'us-east-2' ||
    configuredRegion === 'eu-central-1' || configuredRegion === 'ap-southeast-1' ||
    configuredRegion === 'ap-southeast-2' ? configuredRegion : null;
  const enabled = env.CMS_CONTENT_ENABLED === 'true' && env.CMS_MEDIA_ENABLED === 'true' &&
    storageRegion !== null;
  const publishingEnabled = enabled && env.CMS_MEDIA_PUBLISHING_ENABLED === 'true';
  return {
    enabled,
    publishingEnabled,
    minorPublishingEnabled: publishingEnabled && env.CMS_MINOR_MEDIA_PUBLISHING_ENABLED === 'true',
    storageRegion
  };
}
