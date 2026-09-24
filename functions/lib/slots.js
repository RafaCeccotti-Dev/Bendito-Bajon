const TZ = "America/Argentina/Buenos_Aires"
const START_HOUR = 21
const END_HOUR = 23
const INTERVAL = 15

function pad(n) {
  return String(n).padStart(2, "0")
}

export function buildSlotTimes() {
  const times = []
  let minutes = START_HOUR * 60
  const end = END_HOUR * 60
  while (minutes <= end) {
    times.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`)
    minutes += INTERVAL
  }
  return times
}

export function argentinaParts(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  )
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function addCalendarDay(year, month, day) {
  const next = new Date(`${year}-${month}-${day}T12:00:00-03:00`)
  next.setUTCDate(next.getUTCDate() + 1)
  const p = argentinaParts(next)
  return `${p.year}-${p.month}-${p.day}`
}

export function serviceDate(now = new Date()) {
  const p = argentinaParts(now)
  const nowMin = p.hour * 60 + p.minute
  if (nowMin >= END_HOUR * 60) {
    return addCalendarDay(p.year, p.month, p.day)
  }
  return `${p.year}-${p.month}-${p.day}`
}

export function parseMaxPer(envMax) {
  if (envMax == null || envMax === "") return null
  const n = Number(envMax)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function decorateSlots(counts = {}, maxPerSlot = null, now = new Date()) {
  const date = serviceDate(now)
  const p = argentinaParts(now)
  const today = `${p.year}-${p.month}-${p.day}`
  const nowMin = p.hour * 60 + p.minute

  const slots = buildSlotTimes().map((time) => {
    const [h, m] = time.split(":").map(Number)
    const slotMin = h * 60 + m
    const count = Number(counts[time] || 0)
    const past = date === today && slotMin <= nowMin
    const full = maxPerSlot != null && count >= maxPerSlot
    return {
      time,
      count,
      available: !past && !full,
      reason: past ? "past" : full ? "full" : undefined,
    }
  })

  return { date, maxPerSlot, slots }
}

export function slotKey(date) {
  return `slot-counts:${date}`
}
