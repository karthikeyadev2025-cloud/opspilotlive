import { useEffect } from 'react';
import { SEO_CONFIG } from '../config/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

export default function SEOHead({
  title = SEO_CONFIG.defaultTitle,
  description = SEO_CONFIG.defaultDescription,
  keywords = SEO_CONFIG.keywords,
  canonical = SEO_CONFIG.siteUrl,
  ogImage = '/og-image.jpg',
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));

    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', SEO_CONFIG.openGraph.type, 'property');
    updateMetaTag('og:url', canonical, 'property');
    updateMetaTag('og:image', `${SEO_CONFIG.siteUrl}${ogImage}`, 'property');
    updateMetaTag('og:locale', SEO_CONFIG.openGraph.locale, 'property');
    updateMetaTag('og:site_name', SEO_CONFIG.siteName, 'property');

    updateMetaTag('twitter:card', SEO_CONFIG.twitter.card);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${SEO_CONFIG.siteUrl}${ogImage}`);

    updateMetaTag('author', SEO_CONFIG.business.name);
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('bingbot', 'index, follow');

    updateLinkTag('canonical', canonical);

    updateStructuredData(generateStructuredData());
  }, [title, description, keywords, canonical, ogImage]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function updateStructuredData(data: object) {
  let script = document.querySelector('script[type="application/ld+json"]');

  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

function generateStructuredData() {
  const { business } = SEO_CONFIG;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${SEO_CONFIG.siteUrl}/#software`,
        name: business.name,
        url: SEO_CONFIG.siteUrl,
        description: business.description,
        applicationCategory: business.applicationCategory,
        operatingSystem: business.operatingSystem,
        offers: {
          '@type': 'Offer',
          priceCurrency: business.offers.priceCurrency,
          price: business.offers.price,
          description: business.offers.description,
        },
        featureList: business.features,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '120',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SEO_CONFIG.siteUrl}/#organization`,
        name: business.name,
        url: SEO_CONFIG.siteUrl,
        description: business.description,
        email: business.email,
      },
      {
        '@type': 'WebSite',
        '@id': `${SEO_CONFIG.siteUrl}/#website`,
        url: SEO_CONFIG.siteUrl,
        name: SEO_CONFIG.siteName,
        description: SEO_CONFIG.defaultDescription,
        publisher: {
          '@id': `${SEO_CONFIG.siteUrl}/#organization`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SEO_CONFIG.siteUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SEO_CONFIG.siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Features',
            item: `${SEO_CONFIG.siteUrl}/#features`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Pricing',
            item: `${SEO_CONFIG.siteUrl}/#pricing`,
          },
        ],
      },
    ],
  };
}
