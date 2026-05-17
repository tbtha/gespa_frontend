import { useMemo, useState } from 'react'
import { ESTADOS_CITA, MODALIDAD, TIPO_ATENCION, toEstadoCitaLabel } from '../../constants/ui'

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const STATUS_FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ACTIVE', label: 'Activas' },
  { id: 'COMPLETED', label: 'Completadas' },
  { id: 'CANCELLED', label: 'Canceladas' },
  { id: 'NO_SHOW', label: 'No asistió' },
]

function toDateKey(value) {
  return String(value || '').slice(0, 10)
}

function getStatusClass(status) {
  return {
    SCHEDULED: 'status-scheduled',
    CONFIRMED: 'status-confirmed',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled',
    NO_SHOW: 'status-noshow',
  }[status] || 'status-default'
}

export function AgendaScreen({
  forms,
  onSetForm,
  showAgendaForm,
  onToggleAgendaForm,
  agendaPacientePreview,
  agendaPacienteLoading,
  agendaPacienteNotFound,
  onPacienteRutBlur,
  citas,
  agendaRange,
  onLoadAgenda,
  onChangeAgendaMonth,
  onCreateCita,
  onUpdateEstadoCita,
  onGoFicha,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL')

  const matchesStatusFilter = (status) => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'ACTIVE') return status === 'SCHEDULED' || status === 'CONFIRMED'
    return status === statusFilter
  }

  const monthBase = useMemo(() => {
    const start = String(agendaRange?.desde || '').slice(0, 10)
    if (!start) return new Date()
    return new Date(`${start}T00:00:00`)
  }, [agendaRange])

  const monthLabel = useMemo(() => {
    return monthBase.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  }, [monthBase])

  const citasByDate = useMemo(() => {
    return citas.reduce((acc, cita) => {
      const key = toDateKey(cita.startsAt)
      if (!acc[key]) acc[key] = []
      acc[key].push(cita)
      return acc
    }, {})
  }, [citas])

  const calendarCells = useMemo(() => {
    const year = monthBase.getFullYear()
    const month = monthBase.getMonth()
    const firstDay = new Date(year, month, 1)
    const totalDays = new Date(year, month + 1, 0).getDate()

    const jsWeekDay = firstDay.getDay()
    const mondayBasedOffset = (jsWeekDay + 6) % 7

    const cells = []
    for (let i = 0; i < mondayBasedOffset; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day))
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return cells
  }, [monthBase])

  function goPrevMonth() {
    const next = new Date(monthBase.getFullYear(), monthBase.getMonth() - 1, 1)
    onChangeAgendaMonth?.(next)
  }

  function goNextMonth() {
    const next = new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 1)
    onChangeAgendaMonth?.(next)
  }

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Agenda</h3>
        <div className="inline-controls">
          <button className="primary" onClick={onLoadAgenda}>Cargar agenda</button>
          <button className="ghost" onClick={onToggleAgendaForm}>
            {showAgendaForm ? 'Ocultar nueva cita' : 'Crear una cita'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="month-header">
          <button className="ghost" onClick={goPrevMonth}>← Mes anterior</button>
          <h4 className="month-title">{monthLabel}</h4>
          <button className="ghost" onClick={goNextMonth}>Mes siguiente →</button>
        </div>

        <div className="calendar-legend">
          <span className="legend-item"><i className="legend-dot status-scheduled" />Agendado</span>
          <span className="legend-item"><i className="legend-dot status-confirmed" />Confirmado</span>
          <span className="legend-item"><i className="legend-dot status-completed" />Completado</span>
          <span className="legend-item"><i className="legend-dot status-cancelled" />Cancelado</span>
          <span className="legend-item"><i className="legend-dot status-noshow" />No se presentó</span>
        </div>

        <div className="calendar-grid week-header">
          {WEEK_DAYS.map((day) => <div key={day} className="calendar-weekday">{day}</div>)}
        </div>

        <div className="calendar-grid month-body">
          {calendarCells.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="calendar-cell empty" />
            }

            const key = toDateKey(dateObj.toISOString())
            const dayCitas = (citasByDate[key] || []).filter((cita) => matchesStatusFilter(cita.status))

            return (
              <div key={key} className="calendar-cell">
                <div className="calendar-day-number">{dateObj.getDate()}</div>
                <div className="calendar-day-events">
                  {dayCitas.slice(0, 3).map((cita) => (
                    <button
                      key={cita.id}
                      className={`cal-badge ${getStatusClass(cita.status)}`}
                      onClick={() => onGoFicha(cita.pacienteId, cita.pacienteNombre)}
                    >
                      {new Date(cita.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · {cita.pacienteNombre || `#${cita.pacienteId}`} · {toEstadoCitaLabel(cita.status)}
                    </button>
                  ))}
                  {dayCitas.length > 3 ? <span className="cal-more">+{dayCitas.length - 3} más</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showAgendaForm ? (
        <div className="card">
          <h4>Crear una cita</h4>
          <form className="form-grid" onSubmit={onCreateCita}>
            <label>RUT paciente<input value={forms.citaCreate.pacienteRut} onChange={(e) => onSetForm('citaCreate.pacienteRut', e.target.value)} onBlur={onPacienteRutBlur} required /></label>

            {agendaPacienteLoading ? (
              <p className="muted full">Buscando paciente...</p>
            ) : null}

            {agendaPacienteNotFound ? (
              <>
                <p className="muted full">Paciente no existe. Completa datos para crear e invitar.</p>
                <label>Nombre paciente<input value={forms.citaCreate.pacienteDisplayName} onChange={(e) => onSetForm('citaCreate.pacienteDisplayName', e.target.value)} /></label>
                <label>Correo paciente<input type="email" value={forms.citaCreate.pacienteEmail} onChange={(e) => onSetForm('citaCreate.pacienteEmail', e.target.value)} /></label>
              </>
            ) : null}

            {agendaPacientePreview ? (
              <div className="full card" style={{ margin: 0 }}>
                <h4>Paciente encontrado</h4>
                <p><strong>Nombre:</strong> {agendaPacientePreview.displayName || '—'}</p>
                <p><strong>Correo:</strong> {agendaPacientePreview.email || '—'}</p>
                <p><strong>RUT:</strong> {agendaPacientePreview.rut || '—'}</p>
              </div>
            ) : null}

            <label>Inicio ISO<input value={forms.citaCreate.startsAt} onChange={(e) => onSetForm('citaCreate.startsAt', e.target.value)} required /></label>
            <label>Fin ISO<input value={forms.citaCreate.endsAt} onChange={(e) => onSetForm('citaCreate.endsAt', e.target.value)} required /></label>
            <label>Tipo
              <select value={forms.citaCreate.tipoAtencion} onChange={(e) => onSetForm('citaCreate.tipoAtencion', e.target.value)}>
                {TIPO_ATENCION.map((it) => <option key={it}>{it}</option>)}
              </select>
            </label>
            <label>Modalidad
              <select value={forms.citaCreate.modalidad} onChange={(e) => onSetForm('citaCreate.modalidad', e.target.value)}>
                {MODALIDAD.map((it) => <option key={it}>{it}</option>)}
              </select>
            </label>
            <label className="full">Motivo<textarea value={forms.citaCreate.reason} onChange={(e) => onSetForm('citaCreate.reason', e.target.value)} /></label>
            <button className="primary full" type="submit">Crear una cita</button>
          </form>
        </div>
      ) : null}

      <div className="card">
        <h4>Citas del mes</h4>
        <div className="inline-controls" style={{ marginBottom: 10 }}>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={statusFilter === filter.id ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="appointments-list">
          {citas.filter((c) => matchesStatusFilter(c.status)).map((c) => (
            <div className="appointment-item" key={c.id}>
              <div className="apt-time">{new Date(c.startsAt).toLocaleString('es-CL')}</div>
              <div className="apt-info">
                <p><span className="apt-status-badge">{toEstadoCitaLabel(c.status)}</span> {c.pacienteNombre || `Paciente #${c.pacienteId}`} · {c.tipoAtencion} · {c.modalidad}</p>
              </div>
              <div className="apt-actions">
                <select className="apt-estado" value={c.status} onChange={(e) => onUpdateEstadoCita(c.id, e.target.value)}>
                  {ESTADOS_CITA.map((st) => <option key={st} value={st}>{toEstadoCitaLabel(st)}</option>)}
                </select>
                <button className="ghost apt-view-btn" onClick={() => onGoFicha(c.pacienteId, c.pacienteNombre)}>Ver ficha →</button>
              </div>
            </div>
          ))}
          {citas.filter((c) => matchesStatusFilter(c.status)).length === 0 ? (
            <p className="meta">No hay citas para el filtro seleccionado.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
