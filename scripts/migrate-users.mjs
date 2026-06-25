import { readFileSync, writeFileSync } from "fs"

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const DATA_DIR = "public/data"

for (let chunk = 1; chunk <= 4; chunk++) {
  const path = `${DATA_DIR}/users-${chunk}.json`
  const raw = readFileSync(path, "utf8")
  const users = JSON.parse(raw)
  let changed = 0

  for (const u of users) {
    if (!u.dailyPoints) {
      u.dailyPoints = randomInt(1, 210)
      changed++
    }
    if (!u.weeklyPoints) {
      u.weeklyPoints = randomInt(1, 2400)
      changed++
    }
    if (!u.monthlyPoints) {
      u.monthlyPoints = randomInt(1, 4600)
      changed++
    }
  }

  writeFileSync(path, JSON.stringify(users))
  const size = (Buffer.byteLength(JSON.stringify(users)) / 1024 / 1024).toFixed(1)
  console.log(`  ${path}: ${users.length} users, ${size} MB (${changed} updated)`)
}

console.log("\n✅ Migration complete!")
