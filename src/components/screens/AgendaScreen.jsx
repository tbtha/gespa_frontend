import { useEffect, useMemo, useState } from 'react'
import { ESTADOS_CITA, MODALIDAD, toEstadoCitaLabel, ESTADO_CITA_LABEL, MODALIDAD_LABEL } from '../../constants/ui'

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

function extractOffset(isoValue) {
  const source = String(isoValue || '')
  if (source.endsWith('Z')) return '+00:00'
  const match = source.match(/([+-]\d{2}:\d{2})$/)
  return match?.[1] || '-03:00'
}

function formatDateLocal(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildIsoDateTime(dateYmd, timeHm, offset) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateYmd || '')) ? dateYmd : formatDateLocal(new Date())
  const safeTime = /^\d{2}:\d{2}$/.test(String(timeHm || '')) ? timeHm : '10:00'
  const safeOffset = offset || '-03:00'
  return `${safeDate}T${safeTime}:00${safeOffset}`
}

function parseDateAndTime(isoValue) {
  const raw = String(isoValue || '')
  const date = raw.slice(0, 10)
  const time = raw.slice(11, 16)

  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
    return { date, time }
  }

  const now = new Date()
  return {
    date: formatDateLocal(now),
    time: '10:00',
  }
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
  catalogs = {},
}) {
  const tiposAtencion = Array.isArray(catalogs.tiposAtencion) ? catalogs.tiposAtencion : []
  const modalidades = catalogs.modalidades?.length ? catalogs.modalidades : MODALIDAD.map((v) => ({ value: v, label: MODALIDAD_LABEL[v] || v }))
  const estadosCita = catalogs.estadosCita?.length ? catalogs.estadosCita : ESTADOS_CITA.map((v) => ({ value: v, label: ESTADO_CITA_LABEL[v] || v }))

  const startParts = useMemo(() => parseDateAndTime(forms.citaCreate.startsAt), [forms.citaCreate.startsAt])
  const endParts = useMemo(() => parseDateAndTime(forms.citaCreate.endsAt), [forms.citaCreate.endsAt])
  const [citaFechaInicio, setCitaFechaInicio] = useState(startParts.date)
  const [citaHoraInicio, setCitaHoraInicio] = useState(startParts.time)
  const [citaFechaFin, setCitaFechaFin] = useState(endParts.date)
  const [citaHoraFin, setCitaHoraFin] = useState(endParts.time)
  const [citaOffset, setCitaOffset] = useState(extractOffset(forms.citaCreate.startsAt))

  useEffect(() => {
    setCitaFechaInicio(startParts.date)
    setCitaHoraInicio(startParts.time)
    setCitaFechaFin(endParts.date)
    setCitaHoraFin(endParts.time)
    setCitaOffset(extractOffset(forms.citaCreate.startsAt))
  }, [startParts.date, startParts.time, endParts.date, endParts.time, forms.citaCreate.startsAt])

  useEffect(() => {
    if (!citaFechaInicio || !citaHoraInicio || !citaFechaFin || !citaHoraFin) return

    const startsAt = buildIsoDateTime(citaFechaInicio, citaHoraInicio, citaOffset)
    const endsAt = buildIsoDateTime(citaFechaFin, citaHoraFin, citaOffset)

    if (forms.citaCreate.startsAt !== startsAt) {
      onSetForm('citaCreate.startsAt', startsAt)
    }
    if (forms.citaCreate.endsAt !== endsAt) {
      onSetForm('citaCreate.endsAt', endsAt)
    }
  }, [citaFechaInicio, citaHoraInicio, citaFechaFin, citaHoraFin, citaOffset, forms.citaCreate.startsAt, forms.citaCreate.endsAt, onSetForm])

  const citaDuracion = useMemo(() => {
    const startMs = new Date(forms.citaCreate.startsAt).getTime()
    const endMs = new Date(forms.citaCreate.endsAt).getTime()
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null
    return Math.round((endMs - startMs) / 60000)
  }, [forms.citaCreate.startsAt, forms.citaCreate.endsAt])

  function toEstadoLabel(status) {
    return estadosCita.find((e) => e.value === status)?.label || toEstadoCitaLabel(status)
  }
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
        <div className="month-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
          <button className="ghost" onClick={goPrevMonth} style={{ minWidth: 110 }}>
            ← Mes anterior
          </button>
          <h4 className="month-title" style={{ margin: '0 12px', fontSize: '1.1rem', fontWeight: 700, flex: '0 0 auto', textAlign: 'center' }}>{monthLabel}</h4>
          <button className="ghost" onClick={goNextMonth} style={{ minWidth: 110 }}>
            Mes siguiente →
          </button>
        </div>

        <div className="calendar-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '16px 0 10px 0' }}>
          <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="cal-badge status-scheduled" style={{ minWidth: 80, justifyContent: 'center' }}>Agendado</span>
          </span>
          <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="cal-badge status-confirmed" style={{ minWidth: 80, justifyContent: 'center' }}>Confirmado</span>
          </span>
          <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="cal-badge status-completed" style={{ minWidth: 80, justifyContent: 'center' }}>Completado</span>
          </span>
          <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="cal-badge status-cancelled" style={{ minWidth: 80, justifyContent: 'center' }}>Cancelado</span>
          </span>
          <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="cal-badge status-noshow" style={{ minWidth: 110, justifyContent: 'center' }}>No se presentó</span>
          </span>
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
                      {new Date(cita.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · {cita.pacienteNombre || `#${cita.pacienteId}`} · {toEstadoLabel(cita.status)}
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

            <div
              className="full agenda-range-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}
            >
              <div className="agenda-range-block" style={{ border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '10px', padding: '12px' }}>
                <h5 style={{ marginTop: 0, marginBottom: '10px' }}>Inicio</h5>
                <div className="agenda-range-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label>Fecha
                    <input type="date" value={citaFechaInicio} onChange={(e) => setCitaFechaInicio(e.target.value)} required />
                  </label>
                  <label>Hora
                    <input type="time" value={citaHoraInicio} onChange={(e) => setCitaHoraInicio(e.target.value)} required />
                  </label>
                </div>
              </div>

              <div className="agenda-range-block" style={{ border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '10px', padding: '12px' }}>
                <h5 style={{ marginTop: 0, marginBottom: '10px' }}>Fin</h5>
                <div className="agenda-range-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label>Fecha
                    <input type="date" value={citaFechaFin} onChange={(e) => setCitaFechaFin(e.target.value)} required />
                  </label>
                  <label>Hora
                    <input type="time" value={citaHoraFin} onChange={(e) => setCitaHoraFin(e.target.value)} required />
                  </label>
                </div>
              </div>
            </div>

            <p className="meta full">
              Duración: {Number.isFinite(citaDuracion) ? `${citaDuracion} min` : 'No definida'}
            </p>
            <label>Tipo
              <select value={forms.citaCreate.tipoAtencion} onChange={(e) => onSetForm('citaCreate.tipoAtencion', e.target.value)}>
                {tiposAtencion.length > 0 ? (
                  tiposAtencion.map((it) => <option key={it.value} value={it.value}>{it.label}</option>)
                ) : (
                  <option value="" disabled>Sin tipos de atención configurados</option>
                )}
              </select>
            </label>
            <label>Modalidad
              <select value={forms.citaCreate.modalidad} onChange={(e) => onSetForm('citaCreate.modalidad', e.target.value)}>
                {modalidades.map((it) => <option key={it.value} value={it.value}>{it.label}</option>)}
              </select>
            </label>
            <label className="full">Motivo<textarea value={forms.citaCreate.reason} onChange={(e) => onSetForm('citaCreate.reason', e.target.value)} /></label>
            {tiposAtencion.length === 0 ? (
              <p className="meta full">No hay tipos de atención activos en el catálogo.</p>
            ) : null}
            <button className="primary full" type="submit" disabled={tiposAtencion.length === 0}>Crear una cita</button>
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
                <p><span className="apt-status-badge">{toEstadoLabel(c.status)}</span> {c.pacienteNombre || `Paciente #${c.pacienteId}`} · {tiposAtencion.find((t) => t.value === c.tipoAtencion)?.label || c.tipoAtencion} · {modalidades.find((m) => m.value === c.modalidad)?.label || c.modalidad}</p>
              </div>
              <div className="apt-actions">
                <select className="apt-estado" value={c.status} onChange={(e) => onUpdateEstadoCita(c.id, e.target.value)}>
                  {estadosCita.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
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
