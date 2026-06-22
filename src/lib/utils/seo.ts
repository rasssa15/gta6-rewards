export function generateMetaTitle(title: string, siteName = "GTA 6 Rewards"): string {
  return `${title} | ${siteName}`
}

export function generateMetaDescription(
  excerpt: string,
  maxLength = 160
): string {
  if (excerpt.length <= maxLength) return excerpt
  return excerpt.slice(0, maxLength - 3) + "..."
}

export function generateArticleSchema(article: {
  title: string
  excerpt?: string | null
  imageUrl?: string | null
  publishedAt?: Date | null
  slug: string
  author?: { name?: string | null } | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl,
    datePublished: article.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author?.name || "GTA 6 Rewards",
    },
    publisher: {
      "@type": "Organization",
      name: "GTA 6 Rewards",
    },
    url: `${process.env.NEXT_PUBLIC_URL || "https://gta6rewards.com"}/news/${article.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_URL || "https://gta6rewards.com"}/news/${article.slug}`,
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
