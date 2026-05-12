import api from './client'

export const login = (login, password) =>
  api.post('/auth/login', { login, password }).then(r => r.data)

export const getPage = slug => api.get(`/pages/${slug}`).then(r => r.data)
export const upsertPage = (slug, data) => api.put(`/admin/pages/${slug}`, data).then(r => r.data)

export const listEvents = () => api.get('/events').then(r => r.data)
export const createEvent = data => api.post('/admin/events', data).then(r => r.data)
export const updateEvent = (id, data) => api.put(`/admin/events/${id}`, data).then(r => r.data)
export const deleteEvent = id => api.delete(`/admin/events/${id}`).then(r => r.data)

export const listPlans = () => api.get('/plans').then(r => r.data)
export const createPlan = data => api.post('/admin/plans', data).then(r => r.data)
export const updatePlan = (id, data) => api.put(`/admin/plans/${id}`, data).then(r => r.data)
export const deletePlan = id => api.delete(`/admin/plans/${id}`).then(r => r.data)

export const listHonor = () => api.get('/honor').then(r => r.data)
export const createHonorMember = data => api.post('/admin/honor', data).then(r => r.data)
export const updateHonorMember = (id, data) => api.put(`/admin/honor/${id}`, data).then(r => r.data)
export const deleteHonorMember = id => api.delete(`/admin/honor/${id}`).then(r => r.data)

export const listAchievements = () => api.get('/achievements').then(r => r.data)
export const createAchievement = data => api.post('/admin/achievements', data).then(r => r.data)
export const updateAchievement = (id, data) => api.put(`/admin/achievements/${id}`, data).then(r => r.data)
export const deleteAchievement = id => api.delete(`/admin/achievements/${id}`).then(r => r.data)

export const getFounder = () => api.get('/founder').then(r => r.data)
export const upsertFounder = data => api.put('/admin/founder', data).then(r => r.data)

// uploadFile — multipart-загрузка одного файла; возвращает { url, name, size }
export const uploadFile = file => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/admin/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}
