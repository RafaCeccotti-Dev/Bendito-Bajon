const KEY = "catalog"

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

function unauthorized() {
  return json({ error: "No autorizado" }, 401)
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
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function onRequestPut(context) {
  if (!checkAuth(context.request, context.env)) return unauthorized()
  if (!context.env.CATALOG) {
    return json({ error: "Falta binding CATALOG (KV)" }, 503)
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }

  const payload = {
    products: Array.isArray(body.products) ? body.products : [],
    promos: Array.isArray(body.promos) ? body.promos : [],
    updatedAt: new Date().toISOString(),
  }

  await context.env.CATALOG.put(KEY, JSON.stringify(payload))
  return json({ ok: true, updatedAt: payload.updatedAt })
}
