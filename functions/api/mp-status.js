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
  const configured = Boolean(context.env.MP_ACCESS_TOKEN)
  return json({
    configured,
    mode: configured ? "live-or-test-token" : "disabled",
    message: configured
      ? "MercadoPago listo: el checkout puede generar link de pago."
      : "Falta MP_ACCESS_TOKEN en Cloudflare Pages (Secrets).",
  })
}
