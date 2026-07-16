import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "..", "public", "data")

const FIRST_NAMES = [
  "Elena","Marcus","Aisha","James","Sophia","Liam","Olivia","Noah","Emma","Oliver",
  "Isabella","Lucas","Mia","Ethan","Charlotte","Mason","Amelia","Logan","Harper","Elijah",
  "Abigail","Alexander","Emily","Benjamin","Elizabeth","William","Sofia","Michael","Avery","Daniel",
  "Evelyn","Henry","Ella","Sebastian","Scarlett","Jack","Grace","Owen","Chloe","Gabriel",
  "Victoria","Samuel","Riley","Ryan","Aria","Nathan","Lily","Caleb","Aurora","Dylan",
  "Zara","Kai","Maya","Leo","Stella","Mateo","Hazel","Isaac","Nora","Levi",
  "Penelope","David","Luna","Andrew","Savannah","John","Audrey","Luke","Brooklyn","Anthony",
  "Bella","Lincoln","Claire","Jaxon","Skylar","Asher","Lucy","Christian","Paisley","Thomas",
  "Naomi","Aaron","Elena","Josiah","Ivy","Landon","Eleanor","Adrian","Madelyn","Carson",
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

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function seededRandom(seed) {
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

function generateHexId() {
  let id = ""
  for (let i = 0; i < 32; i++) {
    id += Math.floor(Math.random() * 16).toString(16)
  }
  return id
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function randomDate(startDays, endDays) {
  const now = Date.now()
  const start = now - startDays * 86400000
  const end = now - endDays * 86400000
  return new Date(start + Math.random() * (end - start))
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

const todayStr = new Date().toISOString().split("T")[0]

function generateUsers(count, startIndex) {
  const names = new Set()
  const users = []

  for (let i = 0; i < count; i++) {
    let name
    do {
      name = pick(FIRST_NAMES) + " " + pick(LAST_NAMES)
    } while (names.has(name))
    names.add(name)

    const seed = todayStr + startIndex + i
    const r = seededRandom(seed)

    const allTimeBase = r() * 80000 + 100
    const allTimeBoost = r() > 0.85 ? r() * 30000 : 0
    const allTime = Math.round(allTimeBase + allTimeBoost)

    const monthly = Math.round(clamp(r() * allTime * 0.25, 0, 18000))
    const weekly = Math.round(clamp(r() * monthly * 0.35, 0, 4500))
    const daily = Math.round(clamp(r() * weekly * 0.3, 0, 900))

    const level = Math.max(1, Math.round(1 + Math.sqrt(allTime / 5) + r() * 5))
    const xp = level * 100 + Math.round(r() * 500)

    const created = randomDate(365, 30)
    const lastLogin = randomDate(Math.round(r() * 30), 0)

    users.push({
      id: generateUUID(),
      walletId: generateHexId(),
      name,
      points: allTime,
      dailyPoints: daily,
      weeklyPoints: weekly,
      monthlyPoints: monthly,
      level,
      xp,
      adsWatched: Math.round(r() * 200),
      articlesRead: Math.round(r() * 500),
      scratchCardsPlayed: Math.round(r() * 100),
      createdAt: created.toISOString(),
      lastLogin: lastLogin.toISOString(),
    })
  }

  users.sort((a, b) => b.points - a.points)

  const r = seededRandom(todayStr + "fix" + startIndex)

  if (users.length >= 3) {
    users[0].points = Math.max(users[0].points, 78000 + Math.round(r() * 2000))
    users[1].points = Math.max(users[1].points, 76000 + Math.round(r() * 1500))
    users[2].points = Math.max(users[2].points, 75000 + Math.round(r() * 1000))
  }

  for (let i = 0; i < Math.min(5, users.length); i++) {
    users[i].dailyPoints = Math.max(users[i].dailyPoints, 750 + Math.round(r() * 100))
  }

  for (let i = 0; i < Math.min(10, users.length); i++) {
    users[i].weeklyPoints = Math.max(users[i].weeklyPoints, 3500 + Math.round(r() * 500))
  }

  for (let i = 0; i < Math.min(8, users.length); i++) {
    users[i].monthlyPoints = Math.max(users[i].monthlyPoints, 15000 + Math.round(r() * 1000))
  }

  for (const u of users) {
    u.dailyPoints = Math.min(u.dailyPoints, u.weeklyPoints)
    u.weeklyPoints = Math.min(u.weeklyPoints, u.monthlyPoints)
    u.monthlyPoints = Math.min(u.monthlyPoints, u.points)
  }

  return users
}

const chunk1 = generateUsers(100, 0)
const chunk2 = generateUsers(100, 100)
const chunk3 = generateUsers(100, 200)
const chunk4 = generateUsers(100, 300)

for (let i = 1; i <= 4; i++) {
  const chunk = [chunk1, chunk2, chunk3, chunk4][i - 1]
  writeFileSync(join(DATA_DIR, "users-" + i + ".json"), JSON.stringify(chunk))
  console.log("Written " + chunk.length + " users to users-" + i + ".json")
}

const all = [...chunk1, ...chunk2, ...chunk3, ...chunk4]
console.log("\nTotal users: " + all.length)
console.log("All-time range: " + Math.min(...all.map(u => u.points)).toLocaleString() + " - " + Math.max(...all.map(u => u.points)).toLocaleString())
console.log("Daily range: " + Math.min(...all.map(u => u.dailyPoints)).toLocaleString() + " - " + Math.max(...all.map(u => u.dailyPoints)).toLocaleString())
console.log("Weekly range: " + Math.min(...all.map(u => u.weeklyPoints)).toLocaleString() + " - " + Math.max(...all.map(u => u.weeklyPoints)).toLocaleString())
console.log("Monthly range: " + Math.min(...all.map(u => u.monthlyPoints)).toLocaleString() + " - " + Math.max(...all.map(u => u.monthlyPoints)).toLocaleString())

console.log("\nTop 10 users:")
all.slice(0, 10).forEach((u, i) => {
  console.log("  #" + (i + 1) + " " + u.name + ": " + u.points.toLocaleString() + " pts (D:" + u.dailyPoints + " W:" + u.weeklyPoints + " M:" + u.monthlyPoints + ")")
})
