function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

export async function onRequestPost(context) {
  const password = context.env.ADMIN_PASSWORD
  if (!password) {
    return json(
      { error: "Falta ADMIN_PASSWORD en Cloudflare Pages." },
      503,
    )
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }

  if (body?.password !== password) {
    return json({ error: "Contraseña incorrecta" }, 401)
  }

  const token = btoa(`bendito:${password}`)
  return json({ token })
}
