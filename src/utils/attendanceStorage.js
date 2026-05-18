const STORAGE_KEY = 'fc_attending_events'

function userBucket(user) {
  return user?.id ? `user:${user.id}` : 'anonymous'
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function isLegacyStore(store) {
  return Object.values(store).some(value => value === true)
}

export function readAttendingEvents(user) {
  const store = readStore()
  if (!user?.id && isLegacyStore(store)) return store
  const bucket = store[userBucket(user)]
  return bucket && typeof bucket === 'object' && !Array.isArray(bucket) ? bucket : {}
}

export function rememberAttendance(user, eventId) {
  try {
    const store = readStore()
    const key = userBucket(user)
    const current = readAttendingEvents(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...store,
      [key]: { ...current, [eventId]: true },
    }))
  } catch {
    // Storage can be unavailable; the backend attendance row remains authoritative.
  }
}
