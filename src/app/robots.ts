import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/login', '/auth', '/dashboard/private'],
    },
    sitemap: 'https://sanad.serveirc.com/sitemap.xml',
  }
}
