export const SCHOOL_TIME_ZONE = 'Asia/Novosibirsk'
export const SCHOOL_UTC_OFFSET = '+07:00'

const DATE_TIME_PARTS = {
  timeZone: SCHOOL_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

function partMap(date, options = DATE_TIME_PARTS) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('ru-RU', options)
      .formatToParts(date)
      .map(part => [part.type, part.value]),
  )
}

export function ruInputToSchoolISO(value) {
  if (!value) return ''
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/)
  if (!match) return ''
  const [, dd, mm, yyyy, hh = '00', min = '00'] = match
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00${SCHOOL_UTC_OFFSET}`
}

export function schoolISOToRuInput(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = partMap(date)
  return `${parts.day}.${parts.month}.${parts.year} ${parts.hour}:${parts.minute}`
}

export function formatSchoolDate(iso, options) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ru-RU', { timeZone: SCHOOL_TIME_ZONE, ...options })
}

export function formatSchoolTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', {
    timeZone: SCHOOL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getSchoolDateParts(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const parts = partMap(date)
  return {
    day: Number(parts.day),
    month: Number(parts.month),
    year: Number(parts.year),
    hour: parts.hour,
    minute: parts.minute,
  }
}

export function formatSchoolCommentTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ru-RU', {
    timeZone: SCHOOL_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).replace('.', '')
}
