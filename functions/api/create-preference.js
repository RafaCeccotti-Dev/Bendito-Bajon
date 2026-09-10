import menu from "../data/menu.json"

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
  const token = context.env.MP_ACCESS_TOKEN
  if (!token) {
    return json(
      {
        error:
          "Falta MP_ACCESS_TOKEN en Cloudflare. Cargá el Access Token de MercadoPago Developers.",
        code: "MP_TOKEN_MISSING",
      },
      503,
    )
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }

  if (!body.items?.length) {
    return json({ error: "Carrito vacío" }, 400)
  }

  const origin = new URL(context.request.url).origin

  const mpItems = body.items.map((item) => {
    const product = menu.find((p) => p.id === item.id)
    let unit = item.unit_price
    if (product?.fixedPrice != null) {
      unit = product.fixedPrice
    } else if (product?.prices) {
      const size = String(item.size || "D")
      unit = product.prices[size] ?? item.unit_price
    }
    return {
      title: String(item.title || product?.name || "Producto").slice(0, 120),
      quantity: Number(item.quantity) || 1,
      unit_price: Number(unit) || 0,
      currency_id: "ARS",
    }
  })

  if (body.mode === "delivery" && (body.shippingFee ?? 0) > 0) {
    mpItems.push({
      title: "Envío a domicilio",
      quantity: 1,
      unit_price: Number(body.shippingFee) || 0,
      currency_id: "ARS",
    })
  }

  const preference = {
    items: mpItems,
    payer: {
      name: body.customerName || "Cliente",
    },
    statement_descriptor: "BENDITO BAJON",
    external_reference: `bb-${Date.now()}`,
    back_urls: {
      success: `${origin}/checkout?mp=success`,
      pending: `${origin}/checkout?mp=pending`,
      failure: `${origin}/checkout?mp=failure`,
    },
    auto_return: "approved",
    metadata: {
      customer_name: body.customerName || "",
      mode: body.mode || "pickup",
      address: body.address || "",
    },
  }

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  })

  const data = await mpRes.json()
  if (!mpRes.ok) {
    return json(
      {
        error: data.message || data.error || "Error MercadoPago",
        details: data,
      },
      502,
    )
  }

  return json({
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  })
}
