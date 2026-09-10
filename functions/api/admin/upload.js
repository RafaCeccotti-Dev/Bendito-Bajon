function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

function checkAuth(request, env) {
  const password = env.ADMIN_PASSWORD
  if (!password) return false
  const header = request.headers.get("Authorization") || ""
  const token = header.replace(/^Bearer\s+/i, "").trim()
  try {
    return atob(token) === `bendito:${password}`
  } catch {
    return false
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

/** Guarda imagen como data URL en KV bajo images/<id> y devuelve la URL servible /api/image?id= */
export async function onRequestPost(context) {
  if (!checkAuth(context.request, context.env)) {
    return json({ error: "No autorizado" }, 401)
  }
  if (!context.env.CATALOG) {
    return json({ error: "Falta binding CATALOG (KV)" }, 503)
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }

  const id = String(body.id || "").trim()
  const dataUrl = String(body.dataUrl || "")
  if (!id || !dataUrl.startsWith("data:image/")) {
    return json({ error: "id y dataUrl (image) requeridos" }, 400)
  }
  if (dataUrl.length > 1_800_000) {
    return json({ error: "Imagen muy pesada. Usá una de menos de ~1.2MB." }, 413)
  }

  await context.env.CATALOG.put(`image:${id}`, dataUrl)
  return json({ url: `/api/image?id=${encodeURIComponent(id)}` })
}
