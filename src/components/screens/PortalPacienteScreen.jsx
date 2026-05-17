import { useMemo } from 'react'
import { toEstadoCitaLabel, toModalidadLabel, toTipoAtencionLabel } from '../../constants/ui'

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
  const ultimaAtencion = historialCitas[0] || null

  function renderInicio() {
    return (
      <>
        <div className="card">
          <h4>Estado de atención</h4>
          <p><strong>Próxima atención:</strong> {proximaAtencion ? new Date(proximaAtencion.startsAt).toLocaleString('es-CL') : 'Sin próxima atención'}</p>
          <p><strong>Última atención:</strong> {ultimaAtencion ? new Date(ultimaAtencion.startsAt).toLocaleString('es-CL') : 'Sin atenciones previas'}</p>
          <p><strong>Profesional asignado:</strong> {getProfesionalDisplay(proximaAtencion || ultimaAtencion)}</p>
        </div>

        <div className="card">
          <h4>Preguntas frecuentes</h4>
          <p><strong>¿Cuándo es mi próxima cita?</strong> {proximaAtencion ? new Date(proximaAtencion.startsAt).toLocaleString('es-CL') : 'No tienes una próxima cita agendada.'}</p>
          <p><strong>¿Con quién?</strong> {getProfesionalDisplay(proximaAtencion || ultimaAtencion)}</p>
          <p><strong>¿Tengo documentos disponibles?</strong> Próximamente podrás ver documentos clínicos autorizados en esta sección.</p>
        </div>
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
                    <p>{toTipoAtencionLabel(c.tipoAtencion)} · {toModalidadLabel(c.modalidad)}</p>
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

  function renderDocumentos() {
    return (
      <div className="card">
        <h4>Documentos</h4>
        <p className="meta">Aún no hay documentos disponibles.</p>
        <p className="meta">Esta sección mostrará documentos clínicos autorizados para tu atención.</p>
      </div>
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
      {section === 'paciente-documentos' ? renderDocumentos() : null}
      {section === 'paciente-perfil' ? renderPerfil() : null}

    </section>
  )
}
