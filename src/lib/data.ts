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
  dailyPoints: number
  weeklyPoints: number
  monthlyPoints: number
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

const FIRST_NAMES = [
  "Elena","Marcus","Aisha","James","Sophia","Liam","Olivia","Noah","Emma","Oliver",
  "Isabella","Lucas","Mia","Ethan","Charlotte","Mason","Amelia","Logan","Harper","Elijah",
  "Abigail","Alexander","Emily","Benjamin","Elizabeth","William","Sofia","Michael","Avery","Daniel",
  "Evelyn","Henry","Ella","Sebastian","Scarlett","Jack","Grace","Owen","Chloe","Gabriel",
  "Victoria","Samuel","Riley","Ryan","Aria","Nathan","Lily","Caleb","Aurora","Dylan",
  "Zara","Kai","Maya","Leo","Stella","Mateo","Hazel","Isaac","Nora","Levi",
  "Penelope","David","Luna","Andrew","Savannah","John","Audrey","Luke","Brooklyn","Anthony",
  "Bella","Lincoln","Claire","Jaxon","Skylar","Asher","Lucy","Christian","Paisley","Thomas",
  "Naomi","Aaron","Ivy","Josiah","Elena","Landon","Eleanor","Adrian","Madelyn","Carson",
  "Mila","Roman","Aaliyah","Nicholas","Hannah","Bryce","Autumn","Jeremiah","Quinn","Julian",
  "Priya","Wei","Fatima","Carlos","Mei","Arjun","Sakura","Diego","Yuki","Hassan",
  "Amara","Ravi","Lin","Pedro","Nadia","Akira","Santiago","Ananya","Jin","Rafael",
  "Leila","Tariq","Hana","Erik","Ingrid","Olaf","Sven","Freya","Astrid","Lars",
  "Chen","Xin","Yuna","Hyun","Minji","Taeyeon","Jisoo","Haruto","Sora"
]

const LAST_NAMES = [
  "Rodriguez","Chen","Patel","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson",
  "Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis",
  "Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill",
  "Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter",
  "Kim","Singh","Kumar","Sharma","Verma","Gupta","Das","Choudhury","Malik","Iqbal",
  "Siddiqui","Hossain","Rahman","Ahmed","Ali","Khan","Hassan","Hussein","Abdullah","Omar",
  "Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Ogawa","Kato",
  "Johansson","Andersson","Nilsson","Berg","Lindberg","Gustafsson","Eriksson","Larsson","Karlsson","Svensson",
  "Wolf","Fischer","Schmidt","Weber","Wagner","Hoffmann","Baumann","Schneider","Zimmermann","Braun"
]

function seededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i)
    h |= 0
  }
  return () => {
    h = (h * 1664525 + 1013904223) | 0
    return (h >>> 0) / 4294967296
  }
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function hexId() {
  let id = ""
  for (let i = 0; i < 32; i++) { id += Math.floor(Math.random() * 16).toString(16) }
  return id
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function generateDailyUsers(): UserData[] {
  const todayStr = new Date().toISOString().split("T")[0]
  const users: UserData[] = []
  const names = new Set<string>()

  for (let chunk = 0; chunk < 4; chunk++) {
    for (let i = 0; i < 100; i++) {
      let name: string
      do {
        name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] + " " + LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
      } while (names.has(name))
      names.add(name)

      const r = seededRandom(todayStr + chunk + i)
      const allTimeBase = r() * 80000 + 100
      const allTimeBoost = r() > 0.85 ? r() * 30000 : 0
      const allTime = Math.round(allTimeBase + allTimeBoost)
      const monthly = Math.round(clamp(r() * allTime * 0.25, 0, 18000))
      const weekly = Math.round(clamp(r() * monthly * 0.35, 0, 4500))
      const daily = Math.round(clamp(r() * weekly * 0.3, 0, 900))
      const level = Math.max(1, Math.round(1 + Math.sqrt(allTime / 5) + r() * 5))

      users.push({
        id: uuid(),
        walletId: hexId(),
        name,
        points: allTime,
        dailyPoints: daily,
        weeklyPoints: weekly,
        monthlyPoints: monthly,
        level,
        xp: level * 100,
        adsWatched: Math.round(r() * 200),
        articlesRead: Math.round(r() * 500),
        scratchCardsPlayed: Math.round(r() * 100),
        createdAt: new Date(Date.now() - Math.round(r() * 365 * 86400000)).toISOString(),
        lastLogin: new Date(Date.now() - Math.round(r() * 7 * 86400000)).toISOString(),
      })
    }
  }

  users.sort((a, b) => b.points - a.points)

  const fixRand = seededRandom(todayStr + "fix")
  if (users.length >= 3) {
    users[0].points = Math.max(users[0].points, 78000 + Math.round(fixRand() * 2000))
    users[1].points = Math.max(users[1].points, 76000 + Math.round(fixRand() * 1500))
    users[2].points = Math.max(users[2].points, 75000 + Math.round(fixRand() * 1000))
  }
  for (let i = 0; i < Math.min(5, users.length); i++) {
    users[i].dailyPoints = Math.max(users[i].dailyPoints, 750 + Math.round(fixRand() * 100))
  }
  for (let i = 0; i < Math.min(10, users.length); i++) {
    users[i].weeklyPoints = Math.max(users[i].weeklyPoints, 3500 + Math.round(fixRand() * 500))
  }
  for (let i = 0; i < Math.min(8, users.length); i++) {
    users[i].monthlyPoints = Math.max(users[i].monthlyPoints, 15000 + Math.round(fixRand() * 1000))
  }
  for (const u of users) {
    u.dailyPoints = Math.min(u.dailyPoints, u.weeklyPoints)
    u.weeklyPoints = Math.min(u.weeklyPoints, u.monthlyPoints)
    u.monthlyPoints = Math.min(u.monthlyPoints, u.points)
  }

  return users
}

declare global {
  var simUsersData: { date: string; users: UserData[] } | undefined
}

function ensureUsersLoaded() {
  const todayStr = new Date().toISOString().split("T")[0]
  if (!global.simUsersData || global.simUsersData.date !== todayStr) {
    global.simUsersData = { date: todayStr, users: generateDailyUsers() }
  }
  return global.simUsersData.users
}

export function getUsers(options: { limit?: number; offset?: number }): { users: UserData[]; total: number } {
  const { limit = 50, offset = 0 } = options
  const all = ensureUsersLoaded()
  const total = all.length
  const users = all.slice(offset, offset + limit)
  return { users, total }
}

export function getUserByWalletId(walletId: string): UserData | undefined {
  const all = ensureUsersLoaded()
  return all.find(u => u.walletId === walletId)
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
