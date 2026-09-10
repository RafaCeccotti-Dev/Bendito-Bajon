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
          "Falta MP_ACCESS_TOKEN en Cloudflare. El pedido igual puede ir por WhatsApp.",
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

  const mpItems = body.items.map((item) => {
    const product = menu.find((p) => p.id === item.id)
    let unit = item.unit_price
    if (product?.fixedPrice != null) {
      unit = product.fixedPrice
    } else if (product?.prices) {
      const size = String(item.size || item.title.split(" ").pop() || "D")
      unit = product.prices[size] ?? item.unit_price
    }
    return {
      title: item.title,
      quantity: item.quantity,
      unit_price: Number(unit) || 0,
      currency_id: "ARS",
    }
  })

  if (body.mode === "delivery" && (body.shippingFee ?? 0) > 0) {
    mpItems.push({
      title: "Envío a domicilio",
      quantity: 1,
      unit_price: body.shippingFee,
      currency_id: "ARS",
    })
  }

  const preference = {
    items: mpItems,
    payer: { name: body.customerName },
    statement_descriptor: "BENDITO BAJON",
    external_reference: `${body.customerName}-${Date.now()}`,
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
    return json({ error: data.message ?? "Error MercadoPago" }, 502)
  }

  return json({
    init_point: data.init_point ?? data.sandbox_init_point,
  })
}
