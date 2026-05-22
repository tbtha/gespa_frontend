import { useEffect, useMemo, useState } from 'react'
import {
  adminApi,
  antecedentesApi,
  authApi,
  catalogApi,
  citaApi,
  dashboardApi,
  healthApi,
  horariosApi,
  notaApi,
  pacienteApi,
  profesionalApi,
} from './api/gespaApi'
import { clearAuth, getAuth } from './api/client'
import { Topbar } from './components/layout/Topbar'
import { FooterBar } from './components/layout/FooterBar'
import { WorkspaceNav } from './components/layout/WorkspaceNav'
import { StatusMessage } from './components/layout/StatusMessage'
import { LoginProfesionalScreen } from './components/screens/LoginProfesionalScreen'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { PerfilProfesionalScreen } from './components/screens/PerfilProfesionalScreen'
import { PacientesScreen } from './components/screens/PacientesScreen'
import { FichaScreen } from './components/screens/FichaScreen'
import { AgendaScreen } from './components/screens/AgendaScreen'
import { LoginPacienteScreen } from './components/screens/LoginPacienteScreen'
import { PortalPacienteScreen } from './components/screens/PortalPacienteScreen'
import { AcceptInvitationScreen } from './components/screens/AcceptInvitationScreen'
import { RegisterPacienteScreen } from './components/screens/RegisterPacienteScreen'
import { AdminScreen } from './components/screens/AdminScreen'

function toChileYmd(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

function toChileOffsetString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const tzPart = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT-03:00'
  const normalized = tzPart.replace('GMT', '')

  if (/^[+-]\d{2}:\d{2}$/.test(normalized)) {
    return normalized
  }

  const parsed = normalized.match(/^([+-])(\d{1,2})$/)
  if (!parsed) {
    return '-03:00'
  }

  const sign = parsed[1]
  const hh = String(Number(parsed[2])).padStart(2, '0')
  return `${sign}${hh}:00`
}

function toOffsetString(date = new Date()) {
  const raw = toChileOffsetString(date)
  const sign = raw.startsWith('-') ? '-' : '+'
  const [h, m] = raw.replace(/[+-]/, '').split(':')
  const abs = Number(h) * 60 + Number(m || '0')
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

const todayDate = toChileYmd(new Date())

function buildDayRange(dateYmd) {
  const [year, month, day] = String(dateYmd || '').split('-').map(Number)
  const dayDate = new Date(year || 1970, (month || 1) - 1, day || 1)
  const offset = toOffsetString(dayDate)

  return {
    desde: `${dateYmd}T00:00:00${offset}`,
    hasta: `${dateYmd}T23:59:59${offset}`,
  }
}

function buildMonthRange(baseDate = new Date()) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const first = toChileYmd(firstDay)
  const last = toChileYmd(lastDay)
  const firstOffset = toOffsetString(firstDay)
  const lastOffset = toOffsetString(lastDay)

  return {
    desde: `${first}T00:00:00${firstOffset}`,
    hasta: `${last}T23:59:59${lastOffset}`,
  }
}

function normalizeDashboardPayload(payload) {
  if (!payload) return payload

  return {
    ...payload,
    citasProximas: (payload.citasProximas || []).map((cita) => ({
      ...cita,
      id: cita.id ?? cita.citaId,
      citaId: cita.citaId ?? cita.id,
    })),
  }
}

function normalizeRole(role) {
  const normalized = String(role || '').trim().toUpperCase()

  if (['PACIENTE', 'PATIENT', 'ROLE_PACIENTE', 'ROLE_PATIENT'].includes(normalized)) return 'PATIENT'
  if (['PROFESIONAL', 'PROFESSIONAL', 'ROLE_PROFESIONAL', 'ROLE_PROFESSIONAL'].includes(normalized)) return 'PROFESSIONAL'
  if (['ADMIN', 'ROLE_ADMIN'].includes(normalized)) return 'ADMIN'

  return normalized
}

function isPacienteRole(role) {
  return normalizeRole(role) === 'PATIENT'
}

function isAdminRole(role) {
  return normalizeRole(role) === 'ADMIN'
}

function isProfessionalRole(role) {
  return normalizeRole(role) === 'PROFESSIONAL'
}

function isPatientPortalScreen(screenId) {
  return ['portal-paciente', 'paciente-citas', 'paciente-documentos', 'paciente-perfil'].includes(screenId)
}

function normalizeRut(value) {
  return String(value || '').replace(/[^0-9kK]/g, '').toUpperCase()
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('login-profesional')
  const [statusMsg, setStatusMsg] = useState('')
  const [health, setHealth] = useState('')

  const [auth, setAuthState] = useState({ email: '', password: '' })
  const [currentUser, setCurrentUser] = useState(null)
  const [passwordReset, setPasswordReset] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [invitationForm, setInvitationForm] = useState({ token: '', newPassword: '', confirmPassword: '' })
  const [registerPacienteForm, setRegisterPacienteForm] = useState({
    email: '',
    displayName: '',
    rut: '',
    password: '',
    confirmPassword: '',
  })
  const [emailCheckResult, setEmailCheckResult] = useState(null)

  const [adminUsers, setAdminUsers] = useState([])
  const [adminSpecialties, setAdminSpecialties] = useState([])
  const [adminNewSpecialtyName, setAdminNewSpecialtyName] = useState('')
  const [catalogs, setCatalogs] = useState({
    tiposAtencion: [],
    modalidades: [],
    estadosCita: [],
    previsiones: [],
    estadosCiviles: [],
  })
  const [adminInviteForm, setAdminInviteForm] = useState({
    email: '',
    displayName: '',
    rut: '',
    specialty: '',
  })
  const [professionalSpecialties, setProfessionalSpecialties] = useState([])
  const [adminPatientInviteForm, setAdminPatientInviteForm] = useState({
    email: '',
    displayName: '',
    rut: '',
  })

  const [profesionales, setProfesionales] = useState([])
  const [selectedProfesionalId, setSelectedProfesionalId] = useState('')

  const [dashboard, setDashboard] = useState(null)

  const [pacientes, setPacientes] = useState([])
  const [pacienteSearch, setPacienteSearch] = useState('')
  const [selectedPacienteId, setSelectedPacienteId] = useState('')
  const [selectedPacienteNameHint, setSelectedPacienteNameHint] = useState('')

  const [citas, setCitas] = useState([])
  const [showAgendaForm, setShowAgendaForm] = useState(false)
  const [agendaPacientePreview, setAgendaPacientePreview] = useState(null)
  const [agendaPacienteLoading, setAgendaPacienteLoading] = useState(false)
  const [agendaPacienteNotFound, setAgendaPacienteNotFound] = useState(false)
  const [agendaRange, setAgendaRange] = useState(buildMonthRange(new Date()))

  const [notas, setNotas] = useState([])
  const [citasPaciente, setCitasPaciente] = useState([])
  const [antecedentes, setAntecedentes] = useState(null)
  const [patientProfileRaw, setPatientProfileRaw] = useState(null)
  const [patientProfileForm, setPatientProfileForm] = useState({
    id: '',
    displayName: '',
    email: '',
    phone: '',
    address: '',
  })
  const [patientCitas, setPatientCitas] = useState([])
  const [patientAssignedProfessionalName, setPatientAssignedProfessionalName] = useState('')

  const [horarios, setHorarios] = useState([])
  const [slotsDisponibles, setSlotsDisponibles] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [forms, setForms] = useState({
    profesionalCreate: {
      email: '', password: '', displayName: '', rut: '', specialty: 'Medicina General', phone: '', address: '', institucion: '', descripcion: '',
    },
    profesionalUpdate: {
      id: '', displayName: '', rut: '', specialty: '', phone: '', address: '', institucion: '', descripcion: '',
    },
    pacienteCreate: {
      email: '', password: '', displayName: '', rut: '', birthdate: '', gender: 'FEMENINO', prevision: 'FONASA', estadoCivil: 'SOLTERO', ocupacion: '', phone: '', address: '', emergencyContactName: '', emergencyContactPhone: '',
    },
    pacienteUpdate: {
      id: '', email: '', rut: '', displayName: '', birthdate: '', gender: 'FEMENINO', prevision: 'FONASA', estadoCivil: 'SOLTERO', ocupacion: '', phone: '+569', address: '', emergencyContactName: '', emergencyContactPhone: '',
    },
    notaCreate: {
      professionalId: '', appointmentId: '', noteType: 'CONTROL', content: '', indicaciones: '', plan: '', isPrivate: false,
    },
    antecedente: {
      enfermedadesBase: '', enfermedadesOtros: '', consumoAlcohol: 'NO_CONSUME', consumoTabaco: 'NO_CONSUME', consumoDrogas: 'NO_CONSUME', actividadFisica: 'SEDENTARIO', operacionesPrevias: '', medicamentosRegulares: '', otrosAntecedentes: '',
    },
    citaCreate: {
      pacienteRut: '',
      pacienteEmail: '',
      pacienteDisplayName: '',
      profesionalId: '',
      startsAt: `${todayDate}T10:00:00${toOffsetString(new Date())}`,
      endsAt: `${todayDate}T10:30:00${toOffsetString(new Date())}`,
      tipoAtencion: 'CONTROL',
      modalidad: 'PRESENCIAL',
      reason: '',
      location: '',
    },
  })

  const hasToken = Boolean(getAuth().accessToken)

  useEffect(() => {
    initApp()
  }, [])

  useEffect(() => {
    document.body.setAttribute('data-theme', 'medico')
  }, [])

  useEffect(() => {
    function onAuthExpired() {
      setCurrentUser(null)
      setActiveScreen('login-profesional')
      setStatusMsg('⚠️ Tu sesión expiró. Vuelve a iniciar sesión.')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('gespa:auth-expired', onAuthExpired)
      return () => window.removeEventListener('gespa:auth-expired', onAuthExpired)
    }

    return undefined
  }, [])

  function formatLoginError(error, expectedRole) {
    const msg = String(error?.message || '')
    if (expectedRole === 'PROFESSIONAL' && msg.toLowerCase().includes('no tiene perfil profesional')) {
      return '❌ Esta cuenta no tiene perfil profesional. Ingresa por el login de paciente.'
    }
    if (expectedRole === 'PATIENT' && msg.toLowerCase().includes('no tiene perfil de paciente')) {
      return '❌ Esta cuenta no tiene perfil de paciente. Ingresa por el login profesional.'
    }
    return `❌ ${msg || 'No se pudo iniciar sesión'}`
  }

  async function switchSessionRole(targetRole) {
    try {
      const payload = await authApi.switchRole(targetRole)
      const switchedUser = {
        id: payload.userId,
        email: payload.username,
        displayName: payload.displayName,
        role: normalizeRole(payload.role),
      }
      setCurrentUser(switchedUser)

      if (isPacienteRole(switchedUser.role)) {
        setActiveScreen('portal-paciente')
        await Promise.all([
          loadPatientWorkspace({ silent: true, userId: switchedUser.id }),
          loadCatalogs(),
        ])
      } else if (isProfessionalRole(switchedUser.role)) {
        setSelectedProfesionalId(String(switchedUser.id || ''))
        setForms((prev) => ({
          ...prev,
          notaCreate: { ...prev.notaCreate, professionalId: String(switchedUser.id || '') },
          citaCreate: { ...prev.citaCreate, profesionalId: String(switchedUser.id || '') },
        }))
        setActiveScreen('dashboard')
        await loadDashboardWorkspace()
      } else if (isAdminRole(switchedUser.role)) {
        setActiveScreen('admin')
        await Promise.all([loadAdminUsers(), loadProfessionalSpecialties(), loadAdminSpecialties()])
      }

      setStatusMsg('✅ Rol de sesión actualizado')
    } catch (error) {
      setStatusMsg(`❌ ${error.message}`)
    }
  }

  async function initApp() {
    try {
      const h = await healthApi.check()
      setHealth(JSON.stringify(h))
    } catch (err) {
      setHealth('No disponible')
      setStatusMsg(`❌ Backend no disponible: ${err.message}`)
    }
    if (hasToken) {
      try {
        const me = await authApi.me()
        const normalizedMe = { ...me, role: normalizeRole(me?.role) }
        setCurrentUser(normalizedMe)

        if (isPacienteRole(normalizedMe?.role)) {
          setActiveScreen('portal-paciente')
          await Promise.all([
            loadPatientWorkspace({ silent: true, userId: normalizedMe.id }),
            loadCatalogs(),
          ])
          return
        }

        if (isAdminRole(normalizedMe?.role)) {
          setActiveScreen('admin')
          await Promise.all([loadAdminUsers(), loadProfessionalSpecialties(), loadAdminSpecialties()])
          return
        }

        if (isProfessionalRole(normalizedMe?.role)) {
          setActiveScreen('dashboard')
          setSelectedProfesionalId(String(normalizedMe.id || ''))
          setForms((prev) => ({
            ...prev,
            notaCreate: { ...prev.notaCreate, professionalId: String(normalizedMe.id || '') },
            citaCreate: { ...prev.citaCreate, profesionalId: String(normalizedMe.id || '') },
          }))
          await Promise.all([
            dashboardApi.getByProfesional(normalizedMe.id).then((data) => setDashboard(normalizeDashboardPayload(data))).catch(() => {}),
            citaApi.listByProfesional({ profesionalId: normalizedMe.id, ...agendaRange }).then(setCitas).catch(() => {}),
            loadCatalogs(),
          ])
        }
      } catch {
        // token expirado, inválido o backend error → limpiar silenciosamente
        clearAuth()
        setStatusMsg('')
      }
    }
  }

  async function withFeedback(fn, okMsg) {
    try {
      const value = await fn()
      if (okMsg) setStatusMsg(`✅ ${okMsg}`)
      return value
    } catch (error) {
      setStatusMsg(`❌ ${error.message}`)
      return null
    }
  }

  async function loadMe() {
    return withFeedback(async () => {
      const me = await authApi.me()
      const normalizedMe = { ...me, role: normalizeRole(me?.role) }
      setCurrentUser(normalizedMe)
      return normalizedMe
    })
  }

  async function loadAdminUsers() {
    return withFeedback(async () => {
      const users = await adminApi.listUsers()
      setAdminUsers(users || [])
      return users
    })
  }

  async function loadCatalogs() {
    try {
      const [tiposAtencion, modalidades, estadosCita, previsiones, estadosCiviles] = await Promise.all([
        catalogApi.getTiposAtencion().catch(() => []),
        catalogApi.getModalidades().catch(() => []),
        catalogApi.getEstadosCita().catch(() => []),
        catalogApi.getPrevisiones().catch(() => []),
        catalogApi.getEstadosCiviles().catch(() => []),
      ])
      setCatalogs({
        tiposAtencion: Array.isArray(tiposAtencion) ? tiposAtencion : [],
        modalidades: Array.isArray(modalidades) ? modalidades : [],
        estadosCita: Array.isArray(estadosCita) ? estadosCita : [],
        previsiones: Array.isArray(previsiones) ? previsiones : [],
        estadosCiviles: Array.isArray(estadosCiviles) ? estadosCiviles : [],
      })

      const tipos = Array.isArray(tiposAtencion) ? tiposAtencion : []
      const modalidadesList = Array.isArray(modalidades) ? modalidades : []
      setForms((prev) => ({
        ...prev,
        citaCreate: {
          ...prev.citaCreate,
          tipoAtencion: tipos.some((t) => t.value === prev.citaCreate.tipoAtencion)
            ? prev.citaCreate.tipoAtencion
            : (tipos[0]?.value || prev.citaCreate.tipoAtencion || 'CONTROL'),
          modalidad: modalidadesList.some((m) => m.value === prev.citaCreate.modalidad)
            ? prev.citaCreate.modalidad
            : (modalidadesList[0]?.value || prev.citaCreate.modalidad || 'PRESENCIAL'),
        },
      }))
    } catch {
      // silencioso: se usa fallback de ui.js
    }
  }

  async function loadProfessionalSpecialties() {
    try {
      const options = await profesionalApi.listSpecialties()
      const normalized = Array.isArray(options) ? options : []
      setProfessionalSpecialties(normalized)
      setAdminInviteForm((prev) => ({
        ...prev,
        specialty: prev.specialty && normalized.some((item) => item.name === prev.specialty)
          ? prev.specialty
          : (normalized[0]?.name || ''),
      }))
      return normalized
    } catch {
      setProfessionalSpecialties([])
      return []
    }
  }

  async function loadAdminSpecialties() {
    return withFeedback(async () => {
      const list = await adminApi.listSpecialties()
      setAdminSpecialties(Array.isArray(list) ? list : [])
      return list
    })
  }

  function setAdminInviteField(field, value) {
    setAdminInviteForm((prev) => ({ ...prev, [field]: value }))
  }

  async function createProfessionalInvitation(e) {
    e.preventDefault()
    await withFeedback(async () => {
      const payload = await adminApi.createProfessionalInvitation({ ...adminInviteForm })
      if (payload?.inviteToken) {
        setStatusMsg(`✅ Invitación creada. Token de invitación: ${payload.inviteToken}`)
      } else {
        setStatusMsg('✅ Perfil profesional creado para usuario existente (sin invitación nueva).')
      }
      setAdminInviteForm((prev) => ({
        ...prev,
        email: '',
        displayName: '',
        rut: '',
        specialty: professionalSpecialties.some((item) => item.name === prev.specialty)
          ? prev.specialty
          : (professionalSpecialties[0]?.name || ''),
      }))
      await loadAdminUsers()
      return payload
    })
  }

  function setAdminNewSpecialty(value) {
    setAdminNewSpecialtyName(value)
  }

  async function createAdminSpecialty(e) {
    e.preventDefault()
    await withFeedback(async () => {
      const payload = await adminApi.createSpecialty({ name: adminNewSpecialtyName })
      setAdminNewSpecialtyName('')
      await Promise.all([loadProfessionalSpecialties(), loadAdminSpecialties()])
      return payload
    }, 'Especialidad creada')
  }

  async function toggleAdminSpecialty(specialty) {
    await withFeedback(async () => {
      const updated = await adminApi.updateSpecialtyStatus(specialty.id, !specialty.active)
      setAdminSpecialties((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      await loadProfessionalSpecialties()
      return updated
    }, specialty.active ? 'Especialidad desactivada' : 'Especialidad activada')
  }

  function setAdminPatientInviteField(field, value) {
    setAdminPatientInviteForm((prev) => ({ ...prev, [field]: value }))
  }

  async function createPatientInvitationFromAdmin(e) {
    e.preventDefault()
    await withFeedback(async () => {
      const payload = await adminApi.createPatientInvitation({ ...adminPatientInviteForm })
      if (payload?.inviteToken) {
        setStatusMsg(`✅ Paciente creado. Token de invitación: ${payload.inviteToken}`)
      } else {
        setStatusMsg('✅ Perfil de paciente creado para usuario existente (sin invitación nueva).')
      }
      setAdminPatientInviteForm({ email: '', displayName: '', rut: '' })
      await loadAdminUsers()
      return payload
    })
  }

  async function toggleUserStatus(user) {
    await withFeedback(async () => {
      const updated = await adminApi.updateUserStatus(user.userId, !user.active)
      setAdminUsers((prev) => prev.map((item) => (item.userId === updated.userId ? updated : item)))
      return updated
    }, user.active ? 'Usuario desactivado' : 'Usuario activado')
  }

  async function resetUserPassword(userId) {
    await withFeedback(async () => {
      const payload = await adminApi.resetPassword(userId)
      setStatusMsg(`✅ Password temporal: ${payload.temporaryPassword}`)
      return payload
    })
  }

  async function loadProfesionales() {
    return withFeedback(async () => {

      const data = await profesionalApi.list()
      setProfesionales(data)
      if (!selectedProfesionalId && data.length > 0) {
        setSelectedProfesionalId(String(data[0].id))
        setForms((prev) => ({
          ...prev,
          notaCreate: { ...prev.notaCreate, professionalId: String(data[0].id) },
          citaCreate: { ...prev.citaCreate, profesionalId: String(data[0].id) },
        }))
      }
      return data
    })
  }

  async function onLoginProfesional(e) {
    e.preventDefault()
    try {
      const payload = await authApi.login(auth)
      const loggedUser = {
        id: payload.userId,
        email: payload.username,
        displayName: payload.displayName,
        role: normalizeRole(payload.role),
      }
      setCurrentUser(loggedUser)
      if (isPacienteRole(loggedUser.role)) {
        setActiveScreen('portal-paciente')
        return payload
      }

      if (isAdminRole(loggedUser.role)) {
        setActiveScreen('admin')
        await Promise.all([loadAdminUsers(), loadProfessionalSpecialties(), loadAdminSpecialties()])
        return payload
      }

      if (isProfessionalRole(loggedUser.role)) {
        setSelectedProfesionalId(String(payload.userId || ''))
        setForms((prev) => ({
          ...prev,
          notaCreate: { ...prev.notaCreate, professionalId: String(payload.userId || '') },
          citaCreate: { ...prev.citaCreate, profesionalId: String(payload.userId || '') },
        }))
        setActiveScreen('dashboard')
        await loadDashboardWorkspace()
      }
      setStatusMsg('✅ Login profesional correcto')
    } catch (error) {
      setStatusMsg(formatLoginError(error, 'PROFESSIONAL'))
    }
  }

  async function onLoginPaciente(e) {
    e.preventDefault()
    try {
      const payload = await authApi.loginPaciente(auth)
      const loggedUser = {
        id: payload.userId,
        email: payload.username,
        displayName: payload.displayName,
        role: normalizeRole(payload.role),
      }
      setCurrentUser(loggedUser)
      if (isPacienteRole(loggedUser.role)) {
        setActiveScreen('portal-paciente')
        await loadCatalogs()
        await loadPatientWorkspace({ silent: true, userId: loggedUser.id })
        return payload
      }

      if (isAdminRole(loggedUser.role)) {
        setActiveScreen('admin')
        await Promise.all([loadAdminUsers(), loadProfessionalSpecialties(), loadAdminSpecialties()])
        return payload
      }

      if (isProfessionalRole(loggedUser.role)) {
        setSelectedProfesionalId(String(payload.userId || ''))
        setForms((prev) => ({
          ...prev,
          notaCreate: { ...prev.notaCreate, professionalId: String(payload.userId || '') },
          citaCreate: { ...prev.citaCreate, profesionalId: String(payload.userId || '') },
        }))
        setActiveScreen('dashboard')
        await loadDashboardWorkspace()
      }
      setStatusMsg('✅ Login paciente correcto')
    } catch (error) {
      setStatusMsg(formatLoginError(error, 'PATIENT'))
    }
  }

  async function onLogout() {
    const { refreshToken } = getAuth()
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // ignorar errores del backend al cerrar sesión
    }
    clearAuth()
    setCurrentUser(null)
    setActiveScreen('login-profesional')
    setStatusMsg('')

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  async function loadHorarios(profesionalId) {
    try {
      const data = await horariosApi.list(profesionalId || selectedProfesionalId)
      setHorarios(data || [])
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`)
    }
  }

  async function createHorario(payload) {
    await withFeedback(async () => {
      await horariosApi.create(selectedProfesionalId, payload)
      await loadHorarios()
    }, 'Horario agregado')
  }

  async function deleteHorario(horarioId) {
    await withFeedback(async () => {
      await horariosApi.delete(selectedProfesionalId, horarioId)
      await loadHorarios()
    }, 'Horario eliminado')
  }

  async function fetchSlotsForDate(fecha) {
    setSlotsLoading(true)
    setSlotsDisponibles([])
    try {
      const data = await horariosApi.getAllSlots(fecha)
      setSlotsDisponibles(data || [])
    } catch (err) {
      setStatusMsg(`❌ ${err.message}`)
    } finally {
      setSlotsLoading(false)
    }
  }

  async function agendarDesdeSlot({ slot, motivo, tipoAtencion }) {
    const patientId = Number(patientProfileForm.id || currentUser?.id)
    if (!patientId || !slot) return
    await withFeedback(async () => {
      await citaApi.create({
        pacienteId: patientId,
        profesionalId: slot.profesionalId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        modalidad: slot.modalidad,
        tipoAtencion: tipoAtencion || 'PRIMERA_CONSULTA',
        reason: motivo || '',
      })
      await loadPatientWorkspace({ silent: true })
    }, 'Cita agendada correctamente')
  }

  async function navigateProfessionalScreen(screenId) {
    if (currentUser && isPacienteRole(currentUser.role)) {
      if (!isPatientPortalScreen(screenId)) return
      setActiveScreen(screenId)
      await loadPatientWorkspace({ silent: true }).catch(() => {})
      return
    }

    setActiveScreen(screenId)

    if (screenId === 'dashboard') {
      await loadDashboardWorkspace().catch(() => {})
      return
    }

    if (screenId === 'perfil-profesional' && currentUser?.id) {
      await loadProfesionalToEdit(currentUser.id).catch(() => {})
      await loadHorarios(currentUser.id).catch(() => {})
      return
    }

    if (screenId === 'pacientes') {
      await searchPacientes().catch(() => {})
      return
    }

    if (screenId === 'agenda') {
      await loadAgenda({ silent: true }).catch(() => {})
    }
  }

  function setPatientProfileField(field, value) {
    setPatientProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  async function loadPatientWorkspace({ silent = true, userId: userIdOverride } = {}) {
    const sessionPatientId = userIdOverride ?? currentUser?.id
    if (!sessionPatientId) return null

    const runner = async () => {
      let resolvedPatientId = Number(sessionPatientId)

      if (isPacienteRole(currentUser?.role)) {
        const ownPatientPage = await pacienteApi.list({ size: 1, sortBy: 'id', sortDir: 'desc' }).catch(() => null)
        const ownPatientId = ownPatientPage?.content?.[0]?.id
        if (ownPatientId) {
          resolvedPatientId = Number(ownPatientId)
        }
      }

      const profile = await pacienteApi.get(resolvedPatientId)
      setPatientProfileRaw(profile)
      setPatientProfileForm({
        id: String(profile.id || resolvedPatientId),
        displayName: profile.displayName || '',
        email: profile.email || currentUser?.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })

      const citasData = await citaApi.listByPaciente(resolvedPatientId).catch((err) => {
        setStatusMsg(`❌ No se pudieron cargar las citas: ${err.message}`)
        return []
      })

      const professionalFromCitas = (citasData || []).find((c) => c?.profesionalNombre)
      const assignedName = professionalFromCitas?.profesionalNombre
        || professionalFromCitas?.professionalName
        || profile.professionalName
        || profile.profesionalNombre
        || ''
      const assignedSpecialty = professionalFromCitas?.profesionalEspecialidad
        || professionalFromCitas?.professionalSpecialty
        || profile.professionalSpecialty
        || profile.profesionalEspecialidad
        || ''

      setPatientCitas(citasData || [])
      setPatientAssignedProfessionalName(
        assignedName ? `${assignedName}${assignedSpecialty ? ` · ${assignedSpecialty}` : ''}` : ''
      )

      return true
    }

    if (silent) {
      try {
        return await runner()
      } catch (error) {
        setStatusMsg(`❌ ${error.message}`)
        return null
      }
    }

    return withFeedback(runner, 'Portal paciente cargado')
  }

  async function savePatientProfile(e) {
    e.preventDefault()
    const patientId = Number(patientProfileForm.id || currentUser?.id)
    if (!patientId || !patientProfileRaw) return

    const payload = {
      email: patientProfileForm.email,
      displayName: patientProfileForm.displayName,
      birthdate: patientProfileRaw.birthdate || null,
      gender: patientProfileRaw.gender || null,
      prevision: patientProfileRaw.prevision || null,
      estadoCivil: patientProfileRaw.estadoCivil || null,
      ocupacion: patientProfileRaw.ocupacion || null,
      phone: patientProfileForm.phone || null,
      address: patientProfileForm.address || null,
      emergencyContactName: patientProfileRaw.emergencyContactName || null,
      emergencyContactPhone: patientProfileRaw.emergencyContactPhone || null,
    }

    await withFeedback(() => pacienteApi.update(patientId, payload), 'Perfil actualizado')
    await Promise.all([loadPatientWorkspace({ silent: true, userId: patientId }), loadMe()])
  }

  function setPasswordResetField(field, value) {
    setPasswordReset((prev) => ({ ...prev, [field]: value }))
  }

  async function onRequestPasswordReset(emailInput) {
    const email = String(emailInput || passwordReset.email || auth.email || '').trim()
    if (!email) {
      setStatusMsg('❌ Ingresa un correo para recuperar contraseña')
      return null
    }

    try {
      const data = await authApi.requestPasswordReset({ email })
      setPasswordReset((prev) => ({
        ...prev,
        email,
      }))

      const message = data?.message || 'Si el correo existe, se ha generado un token de recuperación'
      setStatusMsg(`✅ ${message}`)
      return data
    } catch (error) {
      setStatusMsg(`❌ ${error.message}`)
      return null
    }
  }

  async function onConfirmPasswordReset({ token, newPassword, confirmPassword }) {
    const cleanToken = String(token || '').trim()
    if (!cleanToken) {
      setStatusMsg('❌ Ingresa el token de recuperación')
      return null
    }

    if (!newPassword || newPassword.length < 8) {
      setStatusMsg('❌ La nueva contraseña debe tener al menos 8 caracteres')
      return null
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg('❌ Las contraseñas no coinciden')
      return null
    }

    return withFeedback(async () => {
      await authApi.confirmPasswordReset({ token: cleanToken, newPassword })
      setPasswordReset((prev) => ({
        ...prev,
        token: '',
        newPassword: '',
        confirmPassword: '',
      }))
      setAuthState((prev) => ({ ...prev, password: '' }))
      return true
    }, 'Contraseña restablecida correctamente')
  }

  function setInvitationField(field, value) {
    setInvitationForm((prev) => ({ ...prev, [field]: value }))
  }

  async function onAcceptInvitation(e) {
    e.preventDefault()
    if (!invitationForm.newPassword || invitationForm.newPassword.length < 8) {
      setStatusMsg('❌ La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (invitationForm.newPassword !== invitationForm.confirmPassword) {
      setStatusMsg('❌ Las contraseñas no coinciden')
      return
    }

    await withFeedback(async () => {
      await authApi.acceptProfessionalInvitation({ token: invitationForm.token, newPassword: invitationForm.newPassword })
      setInvitationForm({ token: '', newPassword: '', confirmPassword: '' })
      setActiveScreen('login-profesional')
      return true
    }, 'Invitación aceptada. Ya puedes iniciar sesión')
  }

  function setRegisterPacienteField(field, value) {
    setRegisterPacienteForm((prev) => ({ ...prev, [field]: value }))
    
    // Si es email, verificar disponibilidad
    if (field === 'email' && value.trim()) {
      authApi.checkEmail(value).then(result => {
        setEmailCheckResult(result)
      }).catch(() => {
        setEmailCheckResult(null)
      })
    }
  }

  async function onRegisterPaciente(e) {
    e.preventDefault()

    const isExistingUser = emailCheckResult?.exists || Boolean(currentUser?.email && registerPacienteForm.email === currentUser.email)

    if (!isExistingUser) {
      if (!registerPacienteForm.password || registerPacienteForm.password.length < 8) {
        setStatusMsg('❌ La contraseña debe tener al menos 8 caracteres')
        return
      }
      if (registerPacienteForm.password !== registerPacienteForm.confirmPassword) {
        setStatusMsg('❌ Las contraseñas no coinciden')
        return
      }
    }

    await withFeedback(async () => {
      const payload = await authApi.registerPatient({
        email: registerPacienteForm.email,
        displayName: registerPacienteForm.displayName,
        rut: registerPacienteForm.rut,
        ...(isExistingUser ? {} : { password: registerPacienteForm.password }),
      })
      setAuthState((prev) => ({ ...prev, email: registerPacienteForm.email, password: '' }))
      setRegisterPacienteForm({ email: '', displayName: '', rut: '', password: '', confirmPassword: '' })
      setEmailCheckResult(null)
      setActiveScreen('login-paciente')
      return payload
    }, 'Registro exitoso. Ahora puedes iniciar sesión')
  }

  async function loadDashboard() {
    const id = currentUser?.id || selectedProfesionalId
    if (!id) return setStatusMsg('❌ No hay sesión activa')
    await withFeedback(async () => {
      await loadDashboardWorkspace()
      return true
    }, 'Dashboard cargado')
  }

  async function loadDashboardWorkspace() {
    const id = currentUser?.id || selectedProfesionalId
    if (!id) return
    const dayRange = buildDayRange(todayDate)

    await Promise.all([
      dashboardApi.getByProfesional(id).then((data) => setDashboard(normalizeDashboardPayload(data))).catch(() => {}),
      citaApi.listByProfesional({ profesionalId: id, ...dayRange }).then(setCitas).catch(() => {}),
      loadCatalogs(),
    ])
  }

  async function createProfesional(e) {
    e.preventDefault()
    await withFeedback(() => profesionalApi.create({ ...forms.profesionalCreate }), 'Profesional creado')
    await loadProfesionales()
  }

  async function loadProfesionalToEdit(id) {
    await withFeedback(async () => {
      const p = await profesionalApi.get(id)
      setForms((prev) => ({
        ...prev,
        profesionalUpdate: {
          id: String(p.id),
          displayName: p.displayName || '',
          rut: p.rut || '',
          specialty: p.specialty || '',
          phone: p.phone || '',
          address: p.address || '',
          institucion: p.institucion || '',
          descripcion: p.descripcion || '',
        },
      }))
      return p
    }, 'Profesional cargado')
  }

  async function updateProfesional(e) {
    e.preventDefault()
    const { id, ...payload } = forms.profesionalUpdate
    await withFeedback(() => profesionalApi.update(id, payload), 'Perfil profesional actualizado')
    await Promise.all([loadProfesionalToEdit(id), loadMe()])
  }

  async function createPaciente(e) {
    e.preventDefault()
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    await withFeedback(() => pacienteApi.create({
      ...forms.pacienteCreate,
      password: tempPassword,
    }), 'Paciente registrado')
    await searchPacientes()
  }

  async function searchPacientes(queryOverride = null) {
    const searchTerm = queryOverride === null ? pacienteSearch : String(queryOverride || '').trim()
    await withFeedback(async () => {
      const params = { size: 50, sortBy: 'id', sortDir: 'desc' }
      if (searchTerm) params.q = searchTerm
      const data = await pacienteApi.list(params)
      setPacientes(data.content || [])
      return data
    }, 'Pacientes cargados')
  }

  async function goToPacientesFromDashboard(searchText = '') {
    const query = String(searchText || '').trim()
    setPacienteSearch(query)
    setActiveScreen('pacientes')
    await searchPacientes(query)
  }

  async function selectPaciente(id, displayNameHint = '') {
    setSelectedPacienteId(String(id))
    setSelectedPacienteNameHint(String(displayNameHint || ''))
    setActiveScreen('ficha')
    await Promise.all([loadPacienteToEdit(id), loadNotas(id), loadAntecedentes(id), loadCitasPaciente(id)])
  }

  async function loadPacienteToEdit(id = selectedPacienteId) {
    if (!id) return
    await withFeedback(async () => {
      const p = await pacienteApi.get(id)
      setForms((prev) => ({
        ...prev,
        pacienteUpdate: {
          id: String(p.id || id),
          email: p.email || '',
          rut: p.rut || '',
          displayName: p.displayName || '',
          birthdate: p.birthdate || '',
          gender: p.gender || 'FEMENINO',
          prevision: p.prevision || 'FONASA',
          estadoCivil: p.estadoCivil || 'SOLTERO',
          ocupacion: p.ocupacion || '',
          phone: p.phone || '+569',
          address: p.address || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactPhone: p.emergencyContactPhone || '',
        },
      }))
      return p
    })
  }

  async function savePacienteGeneral(e) {
    e.preventDefault()
    if (!selectedPacienteId) return setStatusMsg('❌ Selecciona paciente')

    const { id, email, rut, ...payload } = forms.pacienteUpdate
    await withFeedback(() => pacienteApi.update(id || selectedPacienteId, payload), 'Datos generales actualizados')

    await searchPacientes()
    await loadPacienteToEdit(id || selectedPacienteId)
  }

  async function loadNotas(pacienteId = selectedPacienteId, { silent = true } = {}) {
    if (!pacienteId) {
      setNotas([])
      return
    }

    setNotas([])
    if (silent) {
      try {
        const data = await notaApi.listByPaciente(pacienteId)
        setNotas(data)
        return data
      } catch (error) {
        setStatusMsg(`❌ ${error.message}`)
        return null
      }
    }

    await withFeedback(async () => {
      const data = await notaApi.listByPaciente(pacienteId)
      setNotas(data)
      return data
    }, 'Notas cargadas')
  }

  async function loadCitasPaciente(pacienteId = selectedPacienteId, { silent = true } = {}) {
    if (!pacienteId) {
      setCitasPaciente([])
      return
    }

    setCitasPaciente([])
    try {
      const data = await citaApi.listByPaciente(pacienteId)
      setCitasPaciente(data || [])
      return data
    } catch (err) {
      setStatusMsg(`❌ No se pudieron cargar las citas: ${err.message}`)
      const professionalId = currentUser?.id || selectedProfesionalId

      if (professionalId) {
        try {
          const agendaData = await citaApi.listByProfesional({ profesionalId, ...agendaRange })
          const filtered = (agendaData || []).filter((c) => String(c.pacienteId) === String(pacienteId))
          setCitasPaciente(filtered)

          if (filtered.length > 0 && !silent) {
            setStatusMsg('⚠️ Se cargaron horas del paciente desde la agenda actual')
          }
          return filtered
        } catch {
          // fallback final con estado local
        }
      }

      const localFallback = (citas || []).filter((c) => String(c.pacienteId) === String(pacienteId))
      setCitasPaciente(localFallback)

      if (localFallback.length > 0 && !silent) {
        setStatusMsg('⚠️ Se usaron horas ya cargadas en la agenda')
      }
      if (localFallback.length > 0) return localFallback

      if (!silent) setStatusMsg('⚠️ No se pudieron cargar horas agendadas del paciente')
      return []
    }
  }

  async function createNota(e) {
    e.preventDefault()
    if (!selectedPacienteId) return setStatusMsg('❌ Selecciona paciente')
    if (!forms.notaCreate.appointmentId) return setStatusMsg('❌ La nota debe estar asociada a una cita')
    await withFeedback(() => notaApi.create(selectedPacienteId, {
      ...forms.notaCreate,
      professionalId: Number(forms.notaCreate.professionalId),
      appointmentId: Number(forms.notaCreate.appointmentId),
    }), 'Nota creada')
    await loadNotas(selectedPacienteId, { silent: true })
    await loadCitasPaciente(selectedPacienteId, { silent: true })
  }

  async function loadAntecedentes(pacienteId = selectedPacienteId, { silent = true } = {}) {
    if (!pacienteId) return

    if (silent) {
      try {
        const data = await antecedentesApi.getByPaciente(pacienteId)
        setAntecedentes(data)
        setForms((prev) => ({ ...prev, antecedente: { ...prev.antecedente, ...data } }))
        return data
      } catch (error) {
        setStatusMsg(`❌ ${error.message}`)
        return null
      }
    }

    await withFeedback(async () => {
      const data = await antecedentesApi.getByPaciente(pacienteId)
      setAntecedentes(data)
      setForms((prev) => ({ ...prev, antecedente: { ...prev.antecedente, ...data } }))
      return data
    }, 'Antecedentes cargados')
  }

  async function saveAntecedentes(e) {
    e.preventDefault()
    if (!selectedPacienteId) return setStatusMsg('❌ Selecciona paciente')
    await withFeedback(() => antecedentesApi.upsert(selectedPacienteId, forms.antecedente), 'Antecedentes guardados')
    await loadAntecedentes(selectedPacienteId, { silent: true })
  }

  async function loadAgenda({ silent = false } = {}) {
    const professionalId = currentUser?.id || selectedProfesionalId
    if (!professionalId) return setStatusMsg('❌ No se pudo identificar el profesional de la sesión')

    if (silent) {
      try {
        const data = await citaApi.listByProfesional({ profesionalId: professionalId, ...agendaRange })
        setCitas(data)
        return data
      } catch (error) {
        setStatusMsg(`❌ ${error.message}`)
        return null
      }
    }

    await withFeedback(async () => {
      const data = await citaApi.listByProfesional({ profesionalId: professionalId, ...agendaRange })
      setCitas(data)
      return data
    }, 'Agenda cargada')
  }

  async function changeAgendaMonth(monthDate) {
    const professionalId = currentUser?.id || selectedProfesionalId
    if (!professionalId) return setStatusMsg('❌ No se pudo identificar el profesional de la sesión')

    const nextRange = buildMonthRange(monthDate)
    setAgendaRange(nextRange)

    await withFeedback(async () => {
      const data = await citaApi.listByProfesional({ profesionalId: professionalId, ...nextRange })
      setCitas(data)
      return data
    }, 'Agenda cargada')
  }

  async function createCita(e) {
    e.preventDefault()
    const rutInput = String(forms.citaCreate.pacienteRut || '').trim()
    if (!rutInput) return setStatusMsg('❌ Ingresa el RUT del paciente')

    let patientResult = await lookupPacienteByRut(rutInput, { silent: true })

    if (!patientResult?.id) {
      const inviteDisplayName = String(forms.citaCreate.pacienteDisplayName || '').trim()
      const inviteEmail = String(forms.citaCreate.pacienteEmail || '').trim()

      if (!inviteDisplayName || !inviteEmail) {
        setStatusMsg('❌ Paciente no encontrado. Completa nombre y correo para crear invitación')
        setAgendaPacienteNotFound(true)
        return
      }

      const invitation = await withFeedback(async () => {
        const payload = await pacienteApi.createInvitation({
          rut: rutInput,
          displayName: inviteDisplayName,
          email: inviteEmail,
        })

        setAgendaPacientePreview({
          id: payload.patientId,
          rut: payload.rut,
          displayName: payload.displayName,
          email: payload.email,
        })
        setAgendaPacienteNotFound(false)
        const tokenMsg = payload?.inviteToken ? ` Token de invitación: ${payload.inviteToken}` : ''
        setStatusMsg(`✅ Paciente creado e invitado.${tokenMsg}`)
        return payload
      })

      if (!invitation?.patientId) return
      patientResult = { id: invitation.patientId }
    }

    if (!patientResult?.id) return

    const professionalId = Number(currentUser?.id || forms.citaCreate.profesionalId || selectedProfesionalId)
    if (!professionalId) return setStatusMsg('❌ No se pudo identificar el profesional de la sesión')

    await withFeedback(() => citaApi.create({
      pacienteId: Number(patientResult.id),
      profesionalId: professionalId,
      startsAt: forms.citaCreate.startsAt,
      endsAt: forms.citaCreate.endsAt,
      tipoAtencion: forms.citaCreate.tipoAtencion,
      modalidad: forms.citaCreate.modalidad,
      reason: forms.citaCreate.reason,
      location: forms.citaCreate.location,
    }), 'Cita creada')

    setForms((prev) => ({
      ...prev,
      citaCreate: {
        ...prev.citaCreate,
        pacienteRut: '',
        pacienteEmail: '',
        pacienteDisplayName: '',
        reason: '',
        location: '',
      },
    }))
    setAgendaPacientePreview(null)
    setAgendaPacienteNotFound(false)
    setShowAgendaForm(false)

    await loadAgenda({ silent: true })
  }

  async function lookupPacienteByRut(rut, { silent = false } = {}) {
    const rutInput = String(rut || '').trim()
    if (!rutInput) {
      setAgendaPacientePreview(null)
      setAgendaPacienteNotFound(false)
      return null
    }

    setAgendaPacienteLoading(true)
    try {
      const data = await pacienteApi.list({
        q: rutInput,
        size: 50,
        sortBy: 'id',
        sortDir: 'desc',
      })

      const targetRut = normalizeRut(rutInput)
      const match = (data?.content || []).find((p) => normalizeRut(p.rut) === targetRut)

      if (!match?.id) {
        setAgendaPacientePreview(null)
        setAgendaPacienteNotFound(true)
        if (!silent) setStatusMsg('❌ No se encontró un paciente con ese RUT')
        return null
      }

      setAgendaPacientePreview({
        id: match.id,
        rut: match.rut,
        displayName: match.displayName || '',
        email: match.email || '',
      })
      setAgendaPacienteNotFound(false)
      return match
    } catch (error) {
      setAgendaPacientePreview(null)
      setAgendaPacienteNotFound(false)
      if (!silent) setStatusMsg(`❌ ${error.message}`)
      return null
    } finally {
      setAgendaPacienteLoading(false)
    }
  }

  async function onAgendaPacienteRutBlur() {
    const rutInput = String(forms.citaCreate.pacienteRut || '').trim()
    if (!rutInput) {
      setAgendaPacientePreview(null)
      setAgendaPacienteNotFound(false)
      return
    }
    await lookupPacienteByRut(rutInput, { silent: true })
  }

  async function updateEstadoCita(citaId, status) {
    await withFeedback(() => citaApi.updateEstado(citaId, status), 'Estado de cita actualizado')
    await Promise.all([loadAgenda({ silent: true }), loadDashboardWorkspace()])
  }

  function setForm(path, value) {
    const [root, key] = path.split('.')
    setForms((prev) => ({
      ...prev,
      [root]: { ...prev[root], [key]: value },
    }))
  }

  const pacienteActual = useMemo(() => {
    return pacientes.find((p) => String(p.id) === String(selectedPacienteId))
      || (forms.pacienteUpdate.id && String(forms.pacienteUpdate.id) === String(selectedPacienteId)
        ? {
            id: forms.pacienteUpdate.id,
            displayName: forms.pacienteUpdate.displayName,
            rut: forms.pacienteUpdate.rut,
            email: forms.pacienteUpdate.email,
          }
        : (selectedPacienteId
            ? {
                id: selectedPacienteId,
                displayName: selectedPacienteNameHint,
              }
            : null))
  }, [pacientes, forms.pacienteUpdate, selectedPacienteId, selectedPacienteNameHint])

  const agendaDelDia = useMemo(() => {
    return [...citas]
      .filter((cita) => String(cita.startsAt || '').slice(0, 10) === todayDate)
      .filter((cita) => cita.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  }, [citas])

  function renderScreen() {
    if (currentUser && isPacienteRole(currentUser.role) && !isPatientPortalScreen(activeScreen)) {
      return (
        <PortalPacienteScreen
          currentUser={currentUser}
          section="portal-paciente"
          patientCitas={patientCitas}
          patientProfileRaw={patientProfileRaw}
          assignedProfessionalName={patientAssignedProfessionalName}
          patientProfileForm={patientProfileForm}
          onSetPatientProfileField={setPatientProfileField}
          onSavePatientProfile={savePatientProfile}
          onReloadPacienteData={() => loadPatientWorkspace({ silent: false })}
          onRefreshMe={loadMe}
          slotsDisponibles={slotsDisponibles}
          slotsLoading={slotsLoading}
          tiposAtencionOptions={catalogs.tiposAtencion}
          onFetchSlots={fetchSlotsForDate}
          onAgendarDesdeSlot={agendarDesdeSlot}
        />
      )
    }

    if (currentUser && isAdminRole(currentUser.role) && activeScreen !== 'admin') {
      return (
        <AdminScreen
          inviteForm={adminInviteForm}
          specialtyOptions={professionalSpecialties}
          adminSpecialties={adminSpecialties}
          adminNewSpecialtyName={adminNewSpecialtyName}
          onSetInviteForm={setAdminInviteField}
          onSetAdminNewSpecialty={setAdminNewSpecialty}
          onCreateAdminSpecialty={createAdminSpecialty}
          onToggleAdminSpecialty={toggleAdminSpecialty}
          onCreateInvitation={createProfessionalInvitation}
          patientInviteForm={adminPatientInviteForm}
          onSetPatientInviteForm={setAdminPatientInviteField}
          onCreatePatientInvitation={createPatientInvitationFromAdmin}
          users={adminUsers}
          onReloadUsers={loadAdminUsers}
          onToggleUser={toggleUserStatus}
          onResetPassword={resetUserPassword}
        />
      )
    }

    switch (activeScreen) {
      case 'login-profesional':
        return (
          <LoginProfesionalScreen
            auth={auth}
            setAuthState={setAuthState}
            passwordReset={passwordReset}
            onSetPasswordResetField={setPasswordResetField}
            onRequestPasswordReset={onRequestPasswordReset}
            onConfirmPasswordReset={onConfirmPasswordReset}
            onSubmit={onLoginProfesional}
            onGoPaciente={() => setActiveScreen('login-paciente')}
            onGoAcceptInvitation={() => setActiveScreen('aceptar-invitacion')}
          />
        )
      case 'dashboard':
        return (
          <DashboardScreen
            onLoadDashboard={loadDashboard}
            dashboard={dashboard}
            professionalName={currentUser?.displayName || 'Profesional'}
            todayAppointmentsCount={agendaDelDia.length}
            agendaDelDia={agendaDelDia}
            onUpdateEstadoCita={updateEstadoCita}
            onGoFicha={selectPaciente}
            onGoAgenda={() => navigateProfessionalScreen('agenda')}
            onSearchPaciente={goToPacientesFromDashboard}
          />
        )
      case 'perfil-profesional':
        return (
          <PerfilProfesionalScreen
            currentUser={currentUser}
            forms={forms}
            onSetForm={setForm}
            onUpdateProfesional={updateProfesional}
            horarios={horarios}
            onCreateHorario={createHorario}
            onDeleteHorario={deleteHorario}
          />
        )
      case 'pacientes':
        return (
          <PacientesScreen
            pacienteSearch={pacienteSearch}
            setPacienteSearch={setPacienteSearch}
            forms={forms}
            onSetForm={setForm}
            onSearchPacientes={searchPacientes}
            onCreatePaciente={createPaciente}
            pacientes={pacientes}
            onSelectPaciente={selectPaciente}
            onGoDashboard={() => setActiveScreen('dashboard')}
            onGoAgenda={() => setActiveScreen('agenda')}
          />
        )
      case 'ficha':
        return (
          <FichaScreen
            selectedPacienteId={selectedPacienteId}
            pacienteActual={pacienteActual}
            forms={forms}
            notas={notas}
            citasPaciente={citasPaciente}
            antecedentes={antecedentes}
            catalogs={catalogs}
            onSetForm={setForm}
            onReloadFicha={() => selectedPacienteId && Promise.all([loadPacienteToEdit(), loadNotas(), loadAntecedentes(), loadCitasPaciente()])}
            onSavePacienteGeneral={savePacienteGeneral}
            onSaveAntecedentes={saveAntecedentes}
            onCreateNota={createNota}
            onGoPacientes={() => setActiveScreen('pacientes')}
            onGoAgenda={() => navigateProfessionalScreen('agenda')}
          />
        )
      case 'agenda':
        return (
          <AgendaScreen
            forms={forms}
            onSetForm={setForm}
            showAgendaForm={showAgendaForm}
            onToggleAgendaForm={() => setShowAgendaForm((prev) => !prev)}
            agendaPacientePreview={agendaPacientePreview}
            agendaPacienteLoading={agendaPacienteLoading}
            agendaPacienteNotFound={agendaPacienteNotFound}
            onPacienteRutBlur={onAgendaPacienteRutBlur}
            citas={citas}
            agendaRange={agendaRange}
            onLoadAgenda={loadAgenda}
            onChangeAgendaMonth={changeAgendaMonth}
            onCreateCita={createCita}
            onUpdateEstadoCita={updateEstadoCita}
            onGoFicha={selectPaciente}
            onGoDashboard={() => setActiveScreen('dashboard')}
            onGoPacientes={() => setActiveScreen('pacientes')}
            catalogs={catalogs}
          />
        )
      case 'login-paciente':
        return (
          <LoginPacienteScreen
            auth={auth}
            setAuthState={setAuthState}
            passwordReset={passwordReset}
            onSetPasswordResetField={setPasswordResetField}
            onRequestPasswordReset={onRequestPasswordReset}
            onConfirmPasswordReset={onConfirmPasswordReset}
            onSubmit={onLoginPaciente}
            onGoProfesional={() => setActiveScreen('login-profesional')}
            onGoAcceptInvitation={() => setActiveScreen('aceptar-invitacion')}
            onGoRegisterPaciente={() => {
              if (currentUser?.email) {
                setRegisterPacienteForm((prev) => ({
                  ...prev,
                  email: currentUser.email,
                  displayName: prev.displayName || currentUser.displayName || '',
                }))
                setEmailCheckResult({ exists: true, hasPatientProfile: false, hasProfessionalProfile: true })
              }
              setActiveScreen('registro-paciente')
            }}
          />
        )
      case 'aceptar-invitacion':
        return (
          <AcceptInvitationScreen
            invitationForm={invitationForm}
            onSetInvitationForm={setInvitationField}
            onSubmit={onAcceptInvitation}
            onGoLoginProfesional={() => setActiveScreen('login-profesional')}
          />
        )
      case 'registro-paciente': {
        const isExistingUser = emailCheckResult?.exists || Boolean(currentUser?.email && registerPacienteForm.email === currentUser.email)
        return (
          <RegisterPacienteScreen
            registerForm={registerPacienteForm}
            onSetRegisterForm={setRegisterPacienteField}
            onSubmit={onRegisterPaciente}
            onGoLoginPaciente={() => setActiveScreen('login-paciente')}
            isExistingUser={isExistingUser}
          />
        )
      }
      case 'admin':
        return (
          <AdminScreen
            inviteForm={adminInviteForm}
            specialtyOptions={professionalSpecialties}
            adminSpecialties={adminSpecialties}
            adminNewSpecialtyName={adminNewSpecialtyName}
            onSetInviteForm={setAdminInviteField}
            onSetAdminNewSpecialty={setAdminNewSpecialty}
            onCreateAdminSpecialty={createAdminSpecialty}
            onToggleAdminSpecialty={toggleAdminSpecialty}
            onCreateInvitation={createProfessionalInvitation}
            patientInviteForm={adminPatientInviteForm}
            onSetPatientInviteForm={setAdminPatientInviteField}
            onCreatePatientInvitation={createPatientInvitationFromAdmin}
            users={adminUsers}
            onReloadUsers={loadAdminUsers}
            onToggleUser={toggleUserStatus}
            onResetPassword={resetUserPassword}
          />
        )
      case 'portal-paciente':
      case 'paciente-citas':
      case 'paciente-documentos':
      case 'paciente-perfil':
        return (
          <PortalPacienteScreen
            currentUser={currentUser}
            section={activeScreen}
            patientCitas={patientCitas}
            patientProfileRaw={patientProfileRaw}
            assignedProfessionalName={patientAssignedProfessionalName}
            patientProfileForm={patientProfileForm}
            onSetPatientProfileField={setPatientProfileField}
            onSavePatientProfile={savePatientProfile}
            onReloadPacienteData={() => loadPatientWorkspace({ silent: false })}
            onRefreshMe={loadMe}
            slotsDisponibles={slotsDisponibles}
            slotsLoading={slotsLoading}
            tiposAtencionOptions={catalogs.tiposAtencion}
            onFetchSlots={fetchSlotsForDate}
            onAgendarDesdeSlot={agendarDesdeSlot}
          />
        )
      default:
        return (
          <LoginProfesionalScreen
            auth={auth}
            setAuthState={setAuthState}
            passwordReset={passwordReset}
            onSetPasswordResetField={setPasswordResetField}
            onRequestPasswordReset={onRequestPasswordReset}
            onConfirmPasswordReset={onConfirmPasswordReset}
            onSubmit={onLoginProfesional}
            onGoPaciente={() => setActiveScreen('login-paciente')}
            onGoAcceptInvitation={() => setActiveScreen('aceptar-invitacion')}
          />
        )
    }
  }

  return (
    <div>
      <Topbar
        currentUser={currentUser}
        onLogout={onLogout}
        onSwitchToPatient={() => switchSessionRole('PATIENT')}
        onSwitchToProfessional={() => switchSessionRole('PROFESSIONAL')}
      />
      {currentUser && (isProfessionalRole(currentUser.role) || isPacienteRole(currentUser.role)) ? (
        <div className="app-shell">
          <WorkspaceNav currentUser={currentUser} activeScreen={activeScreen} onNavigate={navigateProfessionalScreen} />
        </div>
      ) : null}
      <div className="app-shell">
        <main className="content clean-content">
          <StatusMessage message={statusMsg} />
          {renderScreen()}
        </main>
      </div>

      <FooterBar />
    </div>
  )
}
