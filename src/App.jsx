import { useEffect, useMemo, useState } from 'react'
import {
  antecedentesApi,
  authApi,
  citaApi,
  dashboardApi,
  evolucionApi,
  healthApi,
  notaApi,
  pacienteApi,
  profesionalApi,
} from './api/gespaApi'
import { clearAuth, getAuth } from './api/client'
import { Topbar } from './components/layout/Topbar'
import { StatusMessage } from './components/layout/StatusMessage'
import { LoginProfesionalScreen } from './components/screens/LoginProfesionalScreen'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { PerfilProfesionalScreen } from './components/screens/PerfilProfesionalScreen'
import { PacientesScreen } from './components/screens/PacientesScreen'
import { FichaScreen } from './components/screens/FichaScreen'
import { AgendaScreen } from './components/screens/AgendaScreen'
import { LoginPacienteScreen } from './components/screens/LoginPacienteScreen'
import { PortalPacienteScreen } from './components/screens/PortalPacienteScreen'

const todayDate = new Date().toISOString().slice(0, 10)

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase()
}

function isPacienteRole(role) {
  const normalized = normalizeRole(role)
  return ['PACIENTE', 'PATIENT', 'ROLE_PACIENTE', 'ROLE_PATIENT'].includes(normalized)
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('login-profesional')
  const [statusMsg, setStatusMsg] = useState('')
  const [health, setHealth] = useState('')

  const [auth, setAuthState] = useState({ email: '', password: '' })
  const [currentUser, setCurrentUser] = useState(null)

  const [profesionales, setProfesionales] = useState([])
  const [selectedProfesionalId, setSelectedProfesionalId] = useState('')

  const [dashboard, setDashboard] = useState(null)

  const [pacientes, setPacientes] = useState([])
  const [pacienteSearch, setPacienteSearch] = useState('')
  const [selectedPacienteId, setSelectedPacienteId] = useState('')

  const [citas, setCitas] = useState([])
  const [agendaRange, setAgendaRange] = useState({
    desde: `${todayDate}T00:00:00-04:00`,
    hasta: `${todayDate}T23:59:59-04:00`,
  })

  const [notas, setNotas] = useState([])
  const [antecedentes, setAntecedentes] = useState(null)
  const [evolucion, setEvolucion] = useState([])
  const [serieEvolucion, setSerieEvolucion] = useState([])

  const [forms, setForms] = useState({
    profesionalCreate: {
      email: '', password: '', displayName: '', specialty: 'MEDICO GENERAL', licenseNumber: '', phone: '', address: '', institucion: '', descripcion: '',
    },
    profesionalUpdate: {
      id: '', displayName: '', specialty: '', licenseNumber: '', phone: '', address: '', institucion: '', descripcion: '',
    },
    pacienteCreate: {
      email: '', password: '', displayName: '', professionalId: '', rut: '', birthdate: '', gender: 'FEMENINO', prevision: 'FONASA', estadoCivil: 'SOLTERO', ocupacion: '', phone: '', address: '', emergencyContactName: '', emergencyContactPhone: '',
    },
    pacienteUpdate: {
      id: '', email: '', rut: '', professionalId: '', displayName: '', birthdate: '', gender: 'FEMENINO', prevision: 'FONASA', estadoCivil: 'SOLTERO', ocupacion: '', phone: '+569', address: '', emergencyContactName: '', emergencyContactPhone: '',
    },
    notaCreate: {
      professionalId: '', appointmentId: '', noteType: 'CONTROL', content: '', indicaciones: '', plan: '', isPrivate: false,
    },
    antecedente: {
      enfermedadesBase: '', enfermedadesOtros: '', consumoAlcohol: 'NO_CONSUME', consumoTabaco: 'NO_CONSUME', consumoDrogas: 'NO_CONSUME', actividadFisica: 'SEDENTARIO', operacionesPrevias: '', medicamentosRegulares: '', otrosAntecedentes: '',
    },
    evolucionCreate: {
      tipoIndicador: 'PESO', etiqueta: '', valor: '', unidad: '', fechaRegistro: todayDate, citaId: '', observacion: '',
    },
    evolucionSerie: { tipo: 'PESO', desde: '', hasta: '' },
    citaCreate: {
      pacienteId: '', profesionalId: '', startsAt: `${todayDate}T10:00:00-04:00`, endsAt: `${todayDate}T10:30:00-04:00`, tipoAtencion: 'CONTROL', modalidad: 'PRESENCIAL', reason: '', location: '',
    },
  })

  const hasToken = Boolean(getAuth().accessToken)

  useEffect(() => {
    initApp()
  }, [])

  useEffect(() => {
    document.body.setAttribute('data-theme', 'medico')
  }, [])

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
        setCurrentUser(me)
        if (isPacienteRole(me?.role)) {
          setActiveScreen('portal-paciente')
          return
        }
        setActiveScreen('dashboard')
        await loadProfesionales()
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
      setCurrentUser(me)
      return me
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
          pacienteCreate: { ...prev.pacienteCreate, professionalId: String(data[0].id) },
          notaCreate: { ...prev.notaCreate, professionalId: String(data[0].id) },
          citaCreate: { ...prev.citaCreate, profesionalId: String(data[0].id) },
        }))
      }
      return data
    })
  }

  async function onLoginProfesional(e) {
    e.preventDefault()
    await withFeedback(async () => {
      const payload = await authApi.login(auth)
      const loggedUser = { id: payload.userId, email: payload.username, displayName: payload.displayName, role: payload.role }
      setCurrentUser(loggedUser)
      if (isPacienteRole(loggedUser.role)) {
        setActiveScreen('portal-paciente')
        return payload
      }
      setSelectedProfesionalId(String(payload.userId || ''))
      setForms((prev) => ({
        ...prev,
        notaCreate: { ...prev.notaCreate, professionalId: String(payload.userId || '') },
        citaCreate: { ...prev.citaCreate, profesionalId: String(payload.userId || '') },
      }))
      await loadProfesionales()
      await dashboardApi.getByProfesional(payload.userId).then(setDashboard).catch(() => {})
      setActiveScreen('dashboard')
      return payload
    }, 'Login profesional correcto')
  }

  async function onLoginPaciente(e) {
    e.preventDefault()
    await withFeedback(async () => {
      const payload = await authApi.loginPaciente(auth)
      const loggedUser = { id: payload.userId, email: payload.username, displayName: payload.displayName, role: payload.role }
      setCurrentUser(loggedUser)
      if (isPacienteRole(loggedUser.role)) {
        setActiveScreen('portal-paciente')
        return payload
      }

      setSelectedProfesionalId(String(payload.userId || ''))
      await loadProfesionales()
      setActiveScreen('dashboard')
      return payload
    }, 'Login paciente correcto')
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
  }

  async function loadDashboard() {
    const id = currentUser?.id || selectedProfesionalId
    if (!id) return setStatusMsg('❌ No hay sesión activa')
    await withFeedback(async () => {
      const data = await dashboardApi.getByProfesional(id)
      setDashboard(data)
      return data
    }, 'Dashboard cargado')
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
          specialty: p.specialty || '',
          licenseNumber: p.licenseNumber || '',
          phone: p.phone || '',
          address: '',
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
    await loadProfesionales()
  }

  async function createPaciente(e) {
    e.preventDefault()
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    await withFeedback(() => pacienteApi.create({
      ...forms.pacienteCreate,
      password: tempPassword,
      professionalId: Number(forms.pacienteCreate.professionalId || selectedProfesionalId || currentUser?.id),
    }), 'Paciente registrado')
    await searchPacientes()
  }

  async function searchPacientes() {
    const profId = currentUser?.id || selectedProfesionalId
    await withFeedback(async () => {
      const params = { size: 50, sortBy: 'id', sortDir: 'desc' }
      if (pacienteSearch) params.q = pacienteSearch
      if (profId) params.professionalId = profId
      const data = await pacienteApi.list(params)
      setPacientes(data.content || [])
      return data
    }, 'Pacientes cargados')
  }

  async function selectPaciente(id) {
    setSelectedPacienteId(String(id))
    setActiveScreen('ficha')
    await Promise.all([loadPacienteToEdit(id), loadNotas(id), loadAntecedentes(id), loadEvolucion(id)])
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
          professionalId: String(p.professionalId || currentUser?.id || selectedProfesionalId || ''),
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
    await withFeedback(() => pacienteApi.update(id || selectedPacienteId, {
      ...payload,
      professionalId: Number(payload.professionalId || currentUser?.id || selectedProfesionalId),
    }), 'Datos generales actualizados')

    await searchPacientes()
    await loadPacienteToEdit(id || selectedPacienteId)
  }

  async function loadNotas(pacienteId = selectedPacienteId) {
    if (!pacienteId) return
    await withFeedback(async () => {
      const data = await notaApi.listByPaciente(pacienteId)
      setNotas(data)
      return data
    }, 'Notas cargadas')
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
    await loadNotas(selectedPacienteId)
  }

  async function loadAntecedentes(pacienteId = selectedPacienteId) {
    if (!pacienteId) return
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
    await loadAntecedentes(selectedPacienteId)
  }

  async function loadEvolucion(pacienteId = selectedPacienteId) {
    if (!pacienteId) return
    await withFeedback(async () => {
      const data = await evolucionApi.listByPaciente(pacienteId)
      setEvolucion(data)
      return data
    }, 'Evolución cargada')
  }

  async function saveEvolucion(e) {
    e.preventDefault()
    if (!selectedPacienteId) return setStatusMsg('❌ Selecciona paciente')
    await withFeedback(() => evolucionApi.create(selectedPacienteId, {
      ...forms.evolucionCreate,
      valor: Number(forms.evolucionCreate.valor),
      citaId: forms.evolucionCreate.citaId ? Number(forms.evolucionCreate.citaId) : null,
    }), 'Control de evolución registrado')
    await loadEvolucion(selectedPacienteId)
  }

  async function loadSerieEvolucion() {
    if (!selectedPacienteId) return setStatusMsg('❌ Selecciona paciente')
    await withFeedback(async () => {
      const data = await evolucionApi.serie(selectedPacienteId, forms.evolucionSerie)
      setSerieEvolucion(data)
      return data
    }, 'Serie de evolución cargada')
  }

  async function loadAgenda() {
    if (!selectedProfesionalId) return setStatusMsg('❌ Selecciona profesional')
    await withFeedback(async () => {
      const data = await citaApi.listByProfesional({ profesionalId: selectedProfesionalId, ...agendaRange })
      setCitas(data)
      return data
    }, 'Agenda cargada')
  }

  async function createCita(e) {
    e.preventDefault()
    await withFeedback(() => citaApi.create({
      ...forms.citaCreate,
      pacienteId: Number(forms.citaCreate.pacienteId),
      profesionalId: Number(forms.citaCreate.profesionalId),
    }), 'Cita creada')
    await loadAgenda()
  }

  async function updateEstadoCita(citaId, status) {
    await withFeedback(() => citaApi.updateEstado(citaId, status), 'Estado de cita actualizado')
    await loadAgenda()
  }

  function setForm(path, value) {
    const [root, key] = path.split('.')
    setForms((prev) => ({
      ...prev,
      [root]: { ...prev[root], [key]: value },
    }))
  }

  const pacienteActual = useMemo(
    () => pacientes.find((p) => String(p.id) === String(selectedPacienteId)),
    [pacientes, selectedPacienteId],
  )

  function renderScreen() {
    if (currentUser && isPacienteRole(currentUser.role) && activeScreen !== 'portal-paciente') {
      return <PortalPacienteScreen currentUser={currentUser} hasToken={hasToken} onRefreshMe={loadMe} />
    }

    switch (activeScreen) {
      case 'login-profesional':
        return (
          <LoginProfesionalScreen
            auth={auth}
            setAuthState={setAuthState}
            onSubmit={onLoginProfesional}
            onGoPaciente={() => setActiveScreen('login-paciente')}
          />
        )
      case 'dashboard':
        return (
          <DashboardScreen
            onLoadDashboard={loadDashboard}
            dashboard={dashboard}
            onUpdateEstadoCita={updateEstadoCita}
            onGoPerfil={() => { setActiveScreen('perfil-profesional'); loadProfesionalToEdit(currentUser?.id) }}
            onGoPacientes={() => setActiveScreen('pacientes')}
            onGoAgenda={() => setActiveScreen('agenda')}
          />
        )
      case 'perfil-profesional':
        return (
          <PerfilProfesionalScreen
            forms={forms}
            onSetForm={setForm}
            onUpdateProfesional={updateProfesional}
            onGoDashboard={() => setActiveScreen('dashboard')}
            onGoPacientes={() => setActiveScreen('pacientes')}
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
            antecedentes={antecedentes}
            evolucion={evolucion}
            serieEvolucion={serieEvolucion}
            onSetForm={setForm}
            onReloadFicha={() => selectedPacienteId && Promise.all([loadPacienteToEdit(), loadNotas(), loadAntecedentes(), loadEvolucion()])}
            onSavePacienteGeneral={savePacienteGeneral}
            onSaveAntecedentes={saveAntecedentes}
            onCreateNota={createNota}
            onSaveEvolucion={saveEvolucion}
            onLoadSerieEvolucion={loadSerieEvolucion}
            onGoPacientes={() => setActiveScreen('pacientes')}
            onGoAgenda={() => setActiveScreen('agenda')}
          />
        )
      case 'agenda':
        return (
          <AgendaScreen
            profesionales={profesionales}
            selectedProfesionalId={selectedProfesionalId}
            setSelectedProfesionalId={setSelectedProfesionalId}
            agendaRange={agendaRange}
            setAgendaRange={setAgendaRange}
            forms={forms}
            onSetForm={setForm}
            citas={citas}
            onLoadAgenda={loadAgenda}
            onCreateCita={createCita}
            onUpdateEstadoCita={updateEstadoCita}
            onGoDashboard={() => setActiveScreen('dashboard')}
            onGoPacientes={() => setActiveScreen('pacientes')}
          />
        )
      case 'login-paciente':
        return (
          <LoginPacienteScreen
            auth={auth}
            setAuthState={setAuthState}
            onSubmit={onLoginPaciente}
            onGoProfesional={() => setActiveScreen('login-profesional')}
          />
        )
      case 'portal-paciente':
        return <PortalPacienteScreen currentUser={currentUser} hasToken={hasToken} onRefreshMe={loadMe} />
      default:
        return <LoginProfesionalScreen auth={auth} setAuthState={setAuthState} onSubmit={onLoginProfesional} />
    }
  }

  return (
    <div>
      <Topbar currentUser={currentUser} onLogout={onLogout} />
      <div className="app-shell">
        <main className="content clean-content">
          <StatusMessage message={statusMsg} />
          {renderScreen()}
        </main>
      </div>
    </div>
  )
}
