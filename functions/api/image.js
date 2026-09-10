export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const id = url.searchParams.get("id")
  if (!id || !context.env.CATALOG) {
    return new Response("Not found", { status: 404 })
  }
  const dataUrl = await context.env.CATALOG.get(`image:${id}`)
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    return new Response("Not found", { status: 404 })
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) {
    return new Response("Bad image", { status: 500 })
  }

  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0))
  return new Response(bytes, {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
