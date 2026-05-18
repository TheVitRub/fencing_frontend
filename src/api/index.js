import api from './client'

export const login = (login, password) =>
  api.post('/auth/login', { login, password }).then(r => r.data)
export const register = data => api.post('/auth/register', data).then(r => r.data)
export const me = () => api.get('/admin/me').then(r => r.data)

export const getPage = slug => api.get(`/pages/${slug}`).then(r => r.data)
export const upsertPage = (slug, data) => api.put(`/admin/pages/${slug}`, data).then(r => r.data)

export const listEvents = () => api.get('/events').then(r => r.data)
export const createEvent = data => api.post('/admin/events', data).then(r => r.data)
export const updateEvent = (id, data) => api.put(`/admin/events/${id}`, data).then(r => r.data)
export const deleteEvent = id => api.delete(`/admin/events/${id}`).then(r => r.data)
export const attendEvent = (id, status = 'going') => api.put(`/admin/events/${id}/attendance?status=${status}`).then(r => r.data)
export const listEventAttendees = id => api.get(`/events/${id}/attendees`).then(r => r.data)

export const listComments = (target_type, target_id) =>
  api.get('/comments', { params: { target_type, target_id } }).then(r => r.data)
export const listAdminComments = (target_type, target_id) =>
  api.get('/admin/comments', { params: { target_type, target_id } }).then(r => r.data)
export const createComment = data => api.post('/admin/comments', data).then(r => r.data)
export const updateCommentStatus = (id, status) => api.put(`/admin/comments/${id}/status`, { status }).then(r => r.data)

export const listNotifications = () => api.get('/admin/notifications').then(r => r.data)
export const markNotificationRead = id => api.put(`/admin/notifications/${id}/read`).then(r => r.data)

export const listUsers = () => api.get('/admin/users').then(r => r.data)
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role }).then(r => r.data)

export const listInstructors = () => api.get('/instructors').then(r => r.data)
export const upsertInstructorProfile = data => api.put('/admin/instructors', data).then(r => r.data)

export const listKnowledge = () =>
  api.get(localStorage.getItem('fc_token') ? '/admin/knowledge-view' : '/knowledge').then(r => r.data)
export const createKnowledge = data => api.post('/admin/knowledge', data).then(r => r.data)
export const updateKnowledge = (id, data) => api.put(`/admin/knowledge/${id}`, data).then(r => r.data)
export const deleteKnowledge = id => api.delete(`/admin/knowledge/${id}`).then(r => r.data)

export const listGlossary = () => api.get('/glossary').then(r => r.data)
export const createGlossary = data => api.post('/admin/glossary', data).then(r => r.data)
export const updateGlossary = (id, data) => api.put(`/admin/glossary/${id}`, data).then(r => r.data)
export const deleteGlossary = id => api.delete(`/admin/glossary/${id}`).then(r => r.data)

export const listProgress = () => api.get('/admin/progress').then(r => r.data)
export const upsertProgress = data => api.put('/admin/progress', data).then(r => r.data)

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
