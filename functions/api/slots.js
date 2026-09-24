import {
  decorateSlots,
  parseMaxPer,
  serviceDate,
  slotKey,
  buildSlotTimes,
} from "../lib/slots.js"

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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

async function readCounts(kv, date) {
  if (!kv) return {}
  const raw = await kv.get(slotKey(date))
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export async function onRequestGet(context) {
  const date = serviceDate()
  const maxPerSlot = parseMaxPer(context.env.SLOT_MAX_PER)
  const counts = await readCounts(context.env.CATALOG, date)
  return json(decorateSlots(counts, maxPerSlot))
}

export async function onRequestPost(context) {
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }

  const time = String(body.slot || "").trim()
  if (!buildSlotTimes().includes(time)) {
    return json({ error: "Horario inválido" }, 400)
  }

  const date = serviceDate()
  const maxPerSlot = parseMaxPer(context.env.SLOT_MAX_PER)
  const kv = context.env.CATALOG
  const counts = await readCounts(kv, date)
  const decorated = decorateSlots(counts, maxPerSlot)
  const current = decorated.slots.find((s) => s.time === time)
  if (!current?.available) {
    return json(
      {
        error:
          current?.reason === "full"
            ? "Ese horario ya está completo. Elegí otro."
            : "Ese horario ya no está disponible.",
      },
      409,
    )
  }

  if (kv) {
    counts[time] = Number(counts[time] || 0) + 1
    await kv.put(slotKey(date), JSON.stringify(counts))
  }

  return json({ ok: true, ...decorateSlots(counts, maxPerSlot) })
}
