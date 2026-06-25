import { readFileSync } from "fs"
import { join } from "path"

const DATA_DIR = join(process.cwd(), "public/data")

export interface ArticleData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  categoryId: string
  categorySlug: string
  categoryName: string
  featuredImage: string
  prices: string
  author: string
  status: string
  viewCount: number
  readingTime: number
  tags: string
  metaTitle: string
  metaDescription: string
  keywords: string
  createdAt: string
}

export interface UserData {
  id: string
  walletId: string
  name: string
  points: number
  level: number
  xp: number
  adsWatched: number
  articlesRead: number
  scratchCardsPlayed: number
  createdAt: string
  lastLogin: string
}

export interface CommentData {
  id: string
  content: string
  articleId: string
  userId: string
  userName: string
  likes: number
  parentId: string | null
  createdAt: string
}

declare global {
  var articlesCache: Map<string, ArticleData[]> | undefined
  var usersChunks: Map<number, UserData[]> | undefined
  var commentsByArticle: Map<string, CommentData[]> | undefined
}

const CATEGORIES = ["gta-6", "rockstar", "playstation", "xbox", "pc-gaming", "nintendo", "esports"]

function readJSON(path: string): any {
  const fullPath = `${DATA_DIR}/${path}`
  const raw = readFileSync(fullPath, "utf8")
  return JSON.parse(raw)
}

function ensureArticlesLoaded() {
  if (!global.articlesCache) {
    global.articlesCache = new Map()
    for (const cat of CATEGORIES) {
      try {
        const data = readJSON(`articles-${cat}.json`) as ArticleData[]
        global.articlesCache.set(cat, data)
      } catch {
        global.articlesCache.set(cat, [])
      }
    }
  }
  return global.articlesCache
}

export function getArticleChunk(category: string): ArticleData[] {
  const cache = ensureArticlesLoaded()
  return cache.get(category) || []
}

export function getAllArticles(): ArticleData[] {
  const cache = ensureArticlesLoaded()
  const all: ArticleData[] = []
  for (const cat of CATEGORIES) {
    const chunk = cache.get(cat)
    if (chunk) all.push(...chunk)
  }
  return all
}

export function getArticleBySlug(slug: string): ArticleData | undefined {
  const cache = ensureArticlesLoaded()
  for (const cat of CATEGORIES) {
    const chunk = cache.get(cat)
    if (chunk) {
      const found = chunk.find(a => a.slug === slug)
      if (found) return found
    }
  }
}

export function getArticleById(id: string): ArticleData | undefined {
  const cache = ensureArticlesLoaded()
  for (const cat of CATEGORIES) {
    const chunk = cache.get(cat)
    if (chunk) {
      const found = chunk.find(a => a.id === id)
      if (found) return found
    }
  }
}

export function getArticles(options: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}): { articles: ArticleData[]; total: number } {
  const { category, search, limit = 20, offset = 0 } = options
  let all: ArticleData[]

  if (category) {
    all = getArticleChunk(category)
  } else {
    all = getAllArticles()
  }

  if (search) {
    const q = search.toLowerCase()
    all = all.filter(
      a => a.title.toLowerCase().includes(q) || a.tags.toLowerCase().includes(q)
    )
  }

  const total = all.length
  const articles = all.slice(offset, offset + limit)
  return { articles, total }
}

function ensureUsersLoaded() {
  if (!global.usersChunks) {
    global.usersChunks = new Map()
    for (let i = 1; i <= 4; i++) {
      try {
        const data = readJSON(`users-${i}.json`) as UserData[]
        global.usersChunks.set(i, data)
      } catch {
        global.usersChunks.set(i, [])
      }
    }
  }
  return global.usersChunks
}

export function getUsers(options: { limit?: number; offset?: number }): { users: UserData[]; total: number } {
  const { limit = 50, offset = 0 } = options
  const chunks = ensureUsersLoaded()

  const all: UserData[] = []
  for (let i = 1; i <= 4; i++) {
    const chunk = chunks.get(i)
    if (chunk) all.push(...chunk)
  }

  const total = all.length
  const users = all.slice(offset, offset + limit)
  return { users, total }
}

export function getUserByWalletId(walletId: string): UserData | undefined {
  const chunks = ensureUsersLoaded()
  for (let i = 1; i <= 4; i++) {
    const chunk = chunks.get(i)
    if (chunk) {
      const found = chunk.find(u => u.walletId === walletId)
      if (found) return found
    }
  }
}

export function getLeaderboard(period: string, limit: number = 50): UserData[] {
  const chunks = ensureUsersLoaded()
  const all: UserData[] = []
  for (let i = 1; i <= 4; i++) {
    const chunk = chunks.get(i)
    if (chunk) all.push(...chunk)
  }
  all.sort((a, b) => b.points - a.points)
  return all.slice(0, limit)
}

function ensureCommentsLoaded() {
  if (!global.commentsByArticle) {
    global.commentsByArticle = new Map()
    for (let i = 1; i <= 4; i++) {
      try {
        const data = readJSON(`comments-${i}.json`) as CommentData[]
        for (const c of data) {
          const existing = global.commentsByArticle.get(c.articleId) || []
          existing.push(c)
          global.commentsByArticle.set(c.articleId, existing)
        }
      } catch {
        // skip missing chunk
      }
    }
  }
  return global.commentsByArticle
}

export function getCommentsForArticle(articleId: string): CommentData[] {
  const map = ensureCommentsLoaded()
  return map.get(articleId) || []
}
