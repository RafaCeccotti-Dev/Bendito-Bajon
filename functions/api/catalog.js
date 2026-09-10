const KEY = "catalog"

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  })
}

export async function onRequestGet(context) {
  const kv = context.env.CATALOG
  if (!kv) {
    return json({ products: [], promos: [] })
  }
  const raw = await kv.get(KEY)
  if (!raw) {
    return json({ products: [], promos: [] })
  }
  try {
    return json(JSON.parse(raw))
  } catch {
    return json({ products: [], promos: [] })
  }
}
