import fs from "fs"
import path from "path"
import https from "https"
import http from "http"

const extracted = JSON.parse(
  fs.readFileSync("public/menu-temp/extracted.json", "utf8"),
)

const map = {
  C8uZyfEAXyu: { id: "cheese-bacon", file: "cheese-bacon.jpg" },
  DVefEaBjmtM: { id: "bendita-crispy", file: "bendita-crispy.jpg" },
  Cy6vQ9nAzeR: { id: "clasica", file: "clasica.jpg" },
  Cxd9987AgsU: { id: "cuarto", file: "cuarto.jpg" },
  "Cc3yga-LQnW": { id: "argenta", file: "argenta.webp" },
  Ccd9V1VLHeW: { id: "oklahoma", file: "oklahoma.webp" },
}

const outDir = "public/menu"
fs.mkdirSync(outDir, { recursive: true })

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const lib = url.startsWith("https") ? https : http
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://www.instagram.com/",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close()
          fs.unlinkSync(dest)
          return download(res.headers.location, dest).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          file.close()
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        }
        res.pipe(file)
        file.on("finish", () => file.close(() => resolve(dest)))
      },
    )
    req.on("error", reject)
  })
}

const summary = []
for (const item of extracted) {
  const meta = map[item.code]
  if (!meta || !item.image) continue
  const dest = path.join(outDir, meta.file)
  try {
    await download(item.image, dest)
    const size = fs.statSync(dest).size
    summary.push({
      code: item.code,
      productId: meta.id,
      file: `/menu/${meta.file}`,
      bytes: size,
      caption: item.caption.slice(0, 80),
    })
    console.log("OK", meta.id, size)
  } catch (e) {
    console.error("FAIL", meta.id, e.message)
  }
}

fs.writeFileSync(
  "public/menu-temp/download-summary.json",
  JSON.stringify(summary, null, 2),
)
