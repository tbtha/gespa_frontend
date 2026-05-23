import { useMemo, useState } from 'react'
import { TIPO_ATENCION, TIPO_ATENCION_LABEL, toEstadoCitaLabel, toModalidadLabel, toTipoAtencionLabel } from '../../constants/ui'

export function PortalPacienteScreen({
  currentUser,
  section,
  patientCitas,
  patientProfileRaw,
  assignedProfessionalName,
  patientProfileForm,
  onSetPatientProfileField,
  onSavePatientProfile,
  onReloadPacienteData,
  onRefreshMe,
  // scheduling
  slotsDisponibles,
  slotsLoading,
  tiposAtencionOptions,
  onFetchSlots,
  onAgendarDesdeSlot,
}) {
  const now = new Date()

  function getProfesionalDisplay(cita = null) {
    const citaName = cita?.profesionalNombre || cita?.professionalName || ''
    const citaSpecialty = cita?.profesionalEspecialidad || cita?.professionalSpecialty || ''

    const profileName = patientProfileRaw?.professionalName || patientProfileRaw?.profesionalNombre || ''
    const profileSpecialty = patientProfileRaw?.professionalSpecialty || patientProfileRaw?.profesionalEspecialidad || ''

    const name = citaName || profileName || assignedProfessionalName || ''
    const specialty = citaSpecialty || profileSpecialty || ''

    if (name) {
      return `${name}${specialty ? ` · ${specialty}` : ''}`
    }

    return patientProfileRaw?.professionalId ? `Profesional #${patientProfileRaw.professionalId}` : 'Profesional asignado'
  }

  const sortedCitas = useMemo(() => {
    return [...(patientCitas || [])].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  }, [patientCitas])

  const proximasCitas = useMemo(() => {
    return sortedCitas.filter((c) => {
      const start = new Date(c.startsAt)
      return start >= now && c.status !== 'CANCELLED'
    })
  }, [sortedCitas, now])

  const historialCitas = useMemo(() => {
    return sortedCitas.filter((c) => {
      const start = new Date(c.startsAt)
      return start < now || c.status === 'COMPLETED' || c.status === 'NO_SHOW' || c.status === 'CANCELLED'
    }).reverse()
  }, [sortedCitas, now])

  const proximaAtencion = proximasCitas[0] || null
  const tipoAtencionItems = useMemo(() => {
    if (Array.isArray(tiposAtencionOptions) && tiposAtencionOptions.length > 0) {
      return tiposAtencionOptions
    }

    return TIPO_ATENCION.map((value) => ({ value, label: TIPO_ATENCION_LABEL[value] || value }))
  }, [tiposAtencionOptions])

  // --- Scheduling modal state ---
  const [showAgendarModal, setShowAgendarModal] = useState(false)
  const [agendarFecha, setAgendarFecha] = useState('')
  const [agendarSlot, setAgendarSlot] = useState(null)
  const [agendarTipoAtencion, setAgendarTipoAtencion] = useState('PRIMERA_CONSULTA')
  const [agendarMotivo, setAgendarMotivo] = useState('')
  // Filtro de especialidad para slots
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('')

  // Obtener lista de especialidades únicas de los slots disponibles
  const especialidadesDisponibles = useMemo(() => {
    const set = new Set()
    slotsDisponibles.forEach(s => {
      if (s.profesionalEspecialidad || s.specialty) set.add(s.profesionalEspecialidad || s.specialty)
    })
    return Array.from(set)
  }, [slotsDisponibles])

  function openAgendarModal() {
    setShowAgendarModal(true)
    setAgendarSlot(null)
    setAgendarTipoAtencion(tipoAtencionItems[0]?.value || 'PRIMERA_CONSULTA')
    setAgendarMotivo('')
    const today = new Date().toISOString().slice(0, 10)
    setAgendarFecha(today)
    onFetchSlots(today)
  }

  function handleFechaChange(e) {
    setAgendarFecha(e.target.value)
    setAgendarSlot(null)
    if (e.target.value) onFetchSlots(e.target.value)
  }

  function handleConfirmarSlot(e) {
    e.preventDefault()
    if (!agendarSlot) return
    onAgendarDesdeSlot({
      slot: agendarSlot,
      motivo: agendarMotivo,
      tipoAtencion: agendarTipoAtencion,
    })
    setShowAgendarModal(false)
  }

  function renderInicio() {
    return (
      <>
        <div className="card">
          <div className="card-header-row">
            <h4>Próximas atenciones</h4>
            <button className="primary sm" onClick={openAgendarModal}>+ Agendar atención</button>
          </div>
          {proximasCitas.length === 0 ? (
            <p className="meta">No tienes próximas atenciones agendadas.</p>
          ) : (
            <div className="appointments-list">
              {proximasCitas.slice(0, 3).map((c) => (
                <div className="appointment-item" key={c.id}>
                  <div className="apt-time">
                    {new Date(c.startsAt).toLocaleDateString('es-CL')}<br />
                    {new Date(c.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="apt-info">
                    <strong>{getProfesionalDisplay(c)}</strong>
                    <p>
                      <span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span>
                      {toModalidadLabel(c.modalidad)}
                      {c.modalidad === 'PRESENCIAL' && (c.lugar || c.location) ? (
                        <span style={{ marginLeft: 8, color: '#64748b', fontWeight: 500 }}>
                          · {c.lugar || c.location}
                        </span>
                      ) : null}
                    </p>
                    {c.modalidad === 'PRESENCIAL' && (c.lugar || c.location) ? (
                      <div style={{ fontSize: '0.97em', color: '#64748b', marginTop: 2 }}>
                        <strong>Lugar:</strong> {c.lugar || c.location}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAgendarModal && (
          <div className="card" style={{ margin: '32px 0', width: '100%', maxWidth: '900px', boxShadow: '0 6px 32px rgba(0,0,0,0.13)' }}>
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '20px 32px 16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <h4 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0 }}>Agendar atención</h4>
              <button className="ghost sm" style={{ color: '#fff', fontSize: '1.2em' }} onClick={() => setShowAgendarModal(false)}>✕</button>
            </div>
            <form onSubmit={agendarSlot ? handleConfirmarSlot : (e) => e.preventDefault()} className="form-grid" style={{ gap: 18, margin: 0, padding: '28px 32px 18px 32px' }}>
              <label style={{ fontWeight: 600 }}>Selecciona una fecha
                <input type="date" value={agendarFecha} min={new Date().toISOString().slice(0, 10)}
                  onChange={handleFechaChange} required />
              </label>
              <label style={{ fontWeight: 600 }}>Tipo de atención
                <select
                  value={agendarTipoAtencion}
                  onChange={(e) => setAgendarTipoAtencion(e.target.value)}
                  required
                >
                  {tipoAtencionItems.map((it) => (
                    <option key={it.value} value={it.value}>{it.label}</option>
                  ))}
                </select>
              </label>
              {slotsLoading ? (
                <p className="meta">Cargando horarios disponibles…</p>
              ) : slotsDisponibles.length === 0 ? (
                <p className="meta">No hay horarios disponibles para esta fecha.</p>
              ) : (
                <div>
                  <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ fontWeight: 500, fontSize: '0.98em' }}>
                      Filtrar por especialidad:
                      <select value={filtroEspecialidad} onChange={e => setFiltroEspecialidad(e.target.value)} style={{ marginLeft: 8 }}>
                        <option value="">Todas</option>
                        {especialidadesDisponibles.map((esp, idx) => (
                          <option key={idx} value={esp}>{esp}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="meta-label" style={{ fontWeight: 600, marginBottom: 6 }}>Horarios disponibles</p>
                  <div className="slots-grid" style={{ gap: 12 }}>
                    {slotsDisponibles
                      .filter(s => !filtroEspecialidad || s.profesionalEspecialidad === filtroEspecialidad || s.specialty === filtroEspecialidad)
                      .map((s, i) => {
                        const start = new Date(s.startsAt)
                        const selected = agendarSlot === s
                        return (
                          <button
                            key={i}
                            className={`slot-btn ${selected ? 'selected' : ''}`}
                            onClick={() => setAgendarSlot(s)}
                            type="button"
                            style={{
                              border: selected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                              background: selected ? 'var(--primary-light)' : 'var(--surface)',
                              color: selected ? 'var(--primary-dark)' : 'var(--text)',
                              boxShadow: selected ? '0 2px 8px rgba(67,97,238,0.08)' : 'none',
                              minWidth: 120,
                              minHeight: 56,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 2,
                              fontWeight: 600,
                              fontSize: '1.05em',
                              transition: 'all 0.18s',
                            }}
                          >
                            <span className="slot-time" style={{ fontWeight: 700, fontSize: '1.1em', color: selected ? 'var(--primary-dark)' : 'var(--primary)' }}>
                              {start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="slot-meta" style={{ fontSize: '0.92em', color: '#64748b', fontWeight: 500 }}>
                              {s.profesionalNombre} · {s.profesionalEspecialidad || s.specialty || '—'}
                            </span>
                            <span className="slot-meta" style={{ fontSize: '0.92em', color: '#64748b', fontWeight: 400 }}>
                              {toModalidadLabel(s.modalidad)}{s.lugar ? ` · ${s.lugar}` : s.place ? ` · ${s.place}` : ''}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              )}
              {agendarSlot && (
                <label style={{ fontWeight: 600 }}>Motivo (opcional)
                  <input value={agendarMotivo} onChange={(e) => setAgendarMotivo(e.target.value)}
                    placeholder="Ej: Control de rutina" />
                </label>
              )}
              <div className="modal-footer" style={{ gap: 10, marginTop: 8, justifyContent: 'flex-end' }}>
                <button className="ghost" type="button" onClick={() => setShowAgendarModal(false)}>Cancelar</button>
                <button className="primary" type="submit" disabled={!agendarSlot}>Confirmar hora</button>
              </div>
            </form>
          </div>
        )}
      </>
    )
  }

  function renderMisCitas() {
    return (
      <>
        <div className="card">
          <h4>Próximas citas</h4>
          {proximasCitas.length === 0 ? (
            <p className="meta">No tienes próximas citas.</p>
          ) : (
            <div className="appointments-list">
              {proximasCitas.map((c) => (
                <div className="appointment-item" key={c.id}>
                  <div className="apt-time">
                    {new Date(c.startsAt).toLocaleDateString('es-CL')}<br />
                    {new Date(c.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="apt-info">
                    <strong>{getProfesionalDisplay(c)}</strong>
                    <p>
                      <span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span>
                      {toTipoAtencionLabel(c.tipoAtencion)} · {toModalidadLabel(c.modalidad)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h4>Historial de citas</h4>
          {historialCitas.length === 0 ? (
            <p className="meta">Aún no hay citas en tu historial.</p>
          ) : (
            <div className="appointments-list">
              {historialCitas.map((c) => (
                <div className="appointment-item" key={`hist-${c.id}`}>
                  <div className="apt-time">{new Date(c.startsAt).toLocaleString('es-CL')}</div>
                  <div className="apt-info">
                    <strong>{getProfesionalDisplay(c)}</strong>
                    <p>
                      {toTipoAtencionLabel(c.tipoAtencion)} · {toModalidadLabel(c.modalidad)}
                      {c.modalidad === 'PRESENCIAL' && (c.lugar || c.location) ? (
                        <span style={{ marginLeft: 8, color: '#64748b', fontWeight: 500 }}>
                          · {c.lugar || c.location}
                        </span>
                      ) : null}
                    </p>
                    <p>Estado de asistencia: <span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }


  function renderPerfil() {
    return (
      <div className="card">
        <h4>Información personal</h4>
        <form className="form-grid" onSubmit={onSavePatientProfile}>
          <label>RUT
            <input value={patientProfileRaw?.rut || ''} disabled />
          </label>
          <label>Nombre
            <input value={patientProfileForm.displayName || ''} onChange={(e) => onSetPatientProfileField('displayName', e.target.value)} required />
          </label>
          <label>Teléfono
            <input value={patientProfileForm.phone || ''} onChange={(e) => onSetPatientProfileField('phone', e.target.value)} />
          </label>
          <label>Correo electrónico
            <input type="email" value={patientProfileForm.email || ''} onChange={(e) => onSetPatientProfileField('email', e.target.value)} required />
          </label>
          <label>Dirección (opcional)
            <input value={patientProfileForm.address || ''} onChange={(e) => onSetPatientProfileField('address', e.target.value)} />
          </label>
          <button className="primary full" type="submit">Guardar cambios</button>
        </form>
      </div>
    )
  }

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Portal del paciente</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onReloadPacienteData}>Actualizar datos</button>
          <button className="ghost" onClick={onRefreshMe}>Refrescar sesión</button>
        </div>
      </div>

      <div className="kpi-grid patient-kpi-grid">
        <article className="kpi"><span>Paciente</span><strong>{currentUser?.displayName || '-'}</strong></article>
        <article className="kpi"><span>Correo</span><strong>{patientProfileForm.email || currentUser?.email || '-'}</strong></article>
        <article className="kpi"><span>Próximas citas</span><strong>{proximasCitas.length}</strong></article>
      </div>

      {section === 'portal-paciente' ? renderInicio() : null}
      {section === 'paciente-citas' ? renderMisCitas() : null}
      {/* Se eliminó la sección de Documentos */}
      {section === 'paciente-perfil' ? renderPerfil() : null}

    </section>
  )
}
