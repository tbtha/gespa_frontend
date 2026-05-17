import { apiClient, clearAuth, setAuth } from './client'

export const authApi = {
  async login(payload) {
    const data = await apiClient.post('/api/auth/login', payload)
    setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data
  },
  async loginPaciente(payload) {
    return this.login(payload)
  },
  refresh: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken }),
  async logout(refreshToken) {
    await apiClient.post('/api/auth/logout', { refreshToken })
    clearAuth()
  },
  requestPasswordReset: (payload) => apiClient.post('/api/auth/password-reset/request', payload),
  confirmPasswordReset: (payload) => apiClient.post('/api/auth/password-reset/confirm', payload),
  acceptProfessionalInvitation: (payload) => apiClient.post('/api/auth/invitations/accept', payload),
  registerPatient: (payload) => apiClient.post('/api/auth/register/patient', payload),
  me: () => apiClient.get('/api/auth/me'),
}

export const adminApi = {
  createProfessionalInvitation: (payload) => apiClient.post('/api/admin/professionals/invitations', payload),
  listUsers: () => apiClient.get('/api/admin/users'),
  updateUserStatus: (userId, active) => apiClient.patch(`/api/admin/users/${userId}/status`, { active }),
  resetPassword: (userId) => apiClient.post(`/api/admin/users/${userId}/reset-password`, {}),
}

export const healthApi = {
  check: () => apiClient.get('/api/health'),
}

export const profesionalApi = {
  create: (payload) => apiClient.post('/api/profesionales', payload),
  list: () => apiClient.get('/api/profesionales'),
  get: (id) => apiClient.get(`/api/profesionales/${id}`),
  update: (id, payload) => apiClient.put(`/api/profesionales/${id}`, payload),
}

export const dashboardApi = {
  getByProfesional: (profesionalId, semanas = 12, limitProximas = 20) =>
    apiClient.get(`/api/dashboard/profesional/${profesionalId}?semanas=${semanas}&limitProximas=${limitProximas}`),
}

export const pacienteApi = {
  create: (payload) => apiClient.post('/api/pacientes', payload),
  createInvitation: (payload) => apiClient.post('/api/pacientes/invitations', payload),
  list: (params = {}) => {
    const qp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== '') qp.append(k, v)
    })
    return apiClient.get(`/api/pacientes${qp.toString() ? `?${qp.toString()}` : ''}`)
  },
  get: (id) => apiClient.get(`/api/pacientes/${id}`),
  update: (id, payload) => apiClient.put(`/api/pacientes/${id}`, payload),
}

export const citaApi = {
  create: (payload) => apiClient.post('/api/citas', payload),
  listByProfesional: ({ profesionalId, desde, hasta }) => {
    const qp = new URLSearchParams({ profesionalId: String(profesionalId) })
    if (desde) qp.append('desde', desde)
    if (hasta) qp.append('hasta', hasta)
    return apiClient.get(`/api/citas?${qp.toString()}`)
  },
  listByPaciente: (pacienteId) => apiClient.get(`/api/citas/paciente/${pacienteId}`),
  update: (id, payload) => apiClient.put(`/api/citas/${id}`, payload),
  updateEstado: (id, status) => apiClient.patch(`/api/citas/${id}/estado`, { status }),
}

export const notaApi = {
  create: (pacienteId, payload) => apiClient.post(`/api/pacientes/${pacienteId}/notas`, payload),
  listByPaciente: (pacienteId) => apiClient.get(`/api/pacientes/${pacienteId}/notas`),
  get: (id) => apiClient.get(`/api/notas/${id}`),
  update: (id, payload) => apiClient.put(`/api/notas/${id}`, payload),
  delete: (id) => apiClient.delete(`/api/notas/${id}`),
}

export const antecedentesApi = {
  getByPaciente: (pacienteId) => apiClient.get(`/api/pacientes/${pacienteId}/antecedentes`),
  upsert: (pacienteId, payload) => apiClient.put(`/api/pacientes/${pacienteId}/antecedentes`, payload),
}
