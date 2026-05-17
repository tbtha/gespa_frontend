import { useEffect, useMemo, useRef, useState } from 'react'
import { ESTADOS_CITA, toEstadoCitaLabel } from '../../constants/ui'

export function DashboardScreen({
  onLoadDashboard,
  dashboard,
  professionalName,
  todayAppointmentsCount,
  agendaDelDia,
  onUpdateEstadoCita,
  onGoFicha,
  onGoAgenda,
  onSearchPaciente,
}) {
  const didAutoLoad = useRef(false)
  const [patientQuery, setPatientQuery] = useState('')

  useEffect(() => {
    if (!didAutoLoad.current && !dashboard) {
      didAutoLoad.current = true
      onLoadDashboard?.()
    }
  }, [dashboard, onLoadDashboard])

  function onSubmitPatientSearch(e) {
    e.preventDefault()
    onSearchPaciente?.(patientQuery)
  }

  const citasAgrupadasPorFecha = useMemo(() => {
    const grupos = {}
    const citas = dashboard?.citasProximas || []

    citas.forEach((cita) => {
      const fechaKey = new Date(cita.startsAt).toISOString().slice(0, 10)
      if (!grupos[fechaKey]) grupos[fechaKey] = []
      grupos[fechaKey].push(cita)
    })

    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, items]) => ({ fecha, items }))
  }, [dashboard?.citasProximas])

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Dashboard</h3>
        <div className="inline-controls">
          <button className="primary" onClick={onLoadDashboard}>Actualizar</button>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="card">
            <h4>Hola, {professionalName}👋</h4>
            <p className="meta">Tienes {todayAppointmentsCount} citas para hoy.</p>
            <form className="inline-controls" onSubmit={onSubmitPatientSearch}>
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="🔍 Buscar paciente..."
              />
              <button className="ghost" type="submit">Buscar</button>
            </form>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="section-head">
                <div>
                  <h4>Agenda del día</h4>
                  <p className="meta">Tu punto de entrada para comenzar la atención clínica.</p>
                </div>
                <button className="ghost" onClick={onGoAgenda}>Ir a agenda</button>
              </div>
              {agendaDelDia?.length ? (
                <div className="appointments-list compact-list">
                  {agendaDelDia.map((c) => (
                    <div className="appointment-item" key={`dia-${c.citaId || c.id}`}>
                      <div className="apt-time">{new Date(c.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="apt-info">
                        <strong>{c.pacienteNombre}</strong>
                        <p><span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span> {c.tipoAtencion}</p>
                      </div>
                      <div className="apt-actions">
                        <button className="ghost apt-view-btn" onClick={() => onGoFicha(c.pacienteId, c.pacienteNombre)}>Abrir ficha</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="meta">No hay horas agendadas para hoy.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h4>Próximas citas en agenda</h4>
            {citasAgrupadasPorFecha.map((grupo) => (
              <div key={grupo.fecha} style={{ marginBottom: 14 }}>
                <h5 style={{ margin: '8px 0' }}>
                  {new Date(`${grupo.fecha}T00:00:00`).toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </h5>
                <div className="appointments-list">
                  {grupo.items.map((c) => (
                    <div className="appointment-item" key={c.id || c.citaId}>
                      <div className="apt-time">{new Date(c.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="apt-info"><strong>{c.pacienteNombre}</strong><p><span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span> {c.tipoAtencion}</p></div>
                      <div className="apt-actions">
                        <select className="apt-estado" value={c.status} onChange={(e) => onUpdateEstadoCita(c.id || c.citaId, e.target.value)}>
                          {ESTADOS_CITA.map((st) => <option key={st} value={st}>{toEstadoCitaLabel(st)}</option>)}
                        </select>
                        <button className="ghost apt-view-btn" onClick={() => onGoFicha(c.pacienteId, c.pacienteNombre)}>Ver ficha →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
