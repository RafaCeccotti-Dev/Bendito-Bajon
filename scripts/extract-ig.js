import fs from "fs"
import path from "path"

const dir = "public/menu-temp"
const codes = [
  "C8uZyfEAXyu",
  "DVefEaBjmtM",
  "Cy6vQ9nAzeR",
  "Cxd9987AgsU",
  "Cc3yga-LQnW",
  "Ccd9V1VLHeW",
]

const results = []

for (const c of codes) {
  const html = fs.readFileSync(path.join(dir, `${c}.html`), "utf8")
  const imgs = [
    ...html.matchAll(
      /https:\/\/[^"'\\\s]+?(?:jpg|jpeg|png|webp)[^"'\\\s]*/gi,
    ),
  ].map((m) => m[0].replace(/&amp;/g, "&"))

  const unique = [...new Set(imgs)].filter(
    (u) =>
      !u.includes("profile") &&
      !u.includes("s150x150") &&
      !u.includes("favicon"),
  )

  // Prefer largest looking CDN urls
  const ranked = unique.sort((a, b) => {
    const score = (u) => {
      if (u.includes("1080")) return 3
      if (u.includes("750")) return 2
      if (u.includes("640")) return 1
      return 0
    }
    return score(b) - score(a)
  })

  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  const captionStart = plain.search(
    /Cheese|Clásica|Clasica|Bacon|Butter|Oklahoma|Argenta|MDB|Bendita|Ameri|Extra|Cuarto|Provo|Crispy|MomentoBajon|la que|Bancan|#/i,
  )
  const caption =
    captionStart >= 0 ? plain.slice(captionStart, captionStart + 280).trim() : ""

  const alts = [...html.matchAll(/alt="([^"]{8,220})"/g)].map((m) => m[1])

  results.push({
    code: c,
    url: `https://www.instagram.com/p/${c}/`,
    caption,
    alts: alts.slice(0, 4),
    image: ranked[0] || null,
    images: ranked.slice(0, 5),
  })
}

fs.writeFileSync(
  path.join(dir, "extracted.json"),
  JSON.stringify(results, null, 2),
)
console.log(JSON.stringify(results, null, 2))
