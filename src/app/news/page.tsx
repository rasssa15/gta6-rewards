import { getAllArticles, getArticleChunk } from "@/lib/data"
import NewsGrid from "./NewsGrid"

const ALL_CATEGORIES = [
  { id: "gta-6", name: "GTA 6", slug: "gta-6" },
  { id: "rockstar", name: "Rockstar", slug: "rockstar" },
  { id: "playstation", name: "PlayStation", slug: "playstation" },
  { id: "xbox", name: "Xbox", slug: "xbox" },
  { id: "pc-gaming", name: "PC Gaming", slug: "pc-gaming" },
  { id: "nintendo", name: "Nintendo", slug: "nintendo" },
  { id: "esports", name: "Esports", slug: "esports" },
]

export default function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const category = searchParams.category || null
  const search = searchParams.search || null

  let articles = category ? getArticleChunk(category) : getAllArticles()
  if (search) {
    const q = search.toLowerCase()
    articles = articles.filter(
      a => a.title.toLowerCase().includes(q) || a.tags.toLowerCase().includes(q)
    )
  }

  const total = articles.length
  const initialArticles = articles.slice(0, 20)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container">
        <NewsGrid
          initialArticles={initialArticles}
          total={total}
          category={category}
          search={search}
          categories={ALL_CATEGORIES}
        />
      </div>
    </div>
  )
}
