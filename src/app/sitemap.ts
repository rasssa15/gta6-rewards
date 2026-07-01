import { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/data"

const BASE = "https://gta6-rewards.vercel.app"

const staticRoutes = [
  { path: "", priority: 1.0 },
  { path: "/news", priority: 0.9 },
  { path: "/ads", priority: 0.7 },
  { path: "/challenges", priority: 0.7 },
  { path: "/dashboard", priority: 0.6 },
  { path: "/earn", priority: 0.8 },
  { path: "/faq", priority: 0.5 },
  { path: "/leaderboard", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/rewards", priority: 0.7 },
  { path: "/redeem", priority: 0.6 },
  { path: "/referral", priority: 0.5 },
  { path: "/terms", priority: 0.3 },
  { path: "/wallpapers", priority: 0.4 },
  { path: "/wallet/create", priority: 0.5 },
  { path: "/wallet/login", priority: 0.5 },
  { path: "/wallet/recover", priority: 0.3 },
  { path: "/wallet/unlock", priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = getAllArticles()

  const articleUrls = articles.map((a) => ({
    url: `${BASE}/news/${a.slug}`,
    lastModified: a.createdAt,
    priority: 0.8,
  }))

  const staticUrls = staticRoutes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    priority: r.priority,
  }))

  return [...staticUrls, ...articleUrls]
}
