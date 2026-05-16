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
  me: () => apiClient.get('/api/auth/me'),
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

export const evolucionApi = {
  create: (pacienteId, payload) => apiClient.post(`/api/pacientes/${pacienteId}/evolucion`, payload),
  listByPaciente: (pacienteId) => apiClient.get(`/api/pacientes/${pacienteId}/evolucion`),
  resumen: (pacienteId) => apiClient.get(`/api/pacientes/${pacienteId}/evolucion/resumen`),
  serie: (pacienteId, { tipo, desde, hasta }) => {
    const qp = new URLSearchParams({ tipo })
    if (desde) qp.append('desde', desde)
    if (hasta) qp.append('hasta', hasta)
    return apiClient.get(`/api/pacientes/${pacienteId}/evolucion/serie?${qp.toString()}`)
  },
  byCita: (citaId) => apiClient.get(`/api/citas/${citaId}/evolucion`),
  delete: (id) => apiClient.delete(`/api/evolucion/${id}`),
}
