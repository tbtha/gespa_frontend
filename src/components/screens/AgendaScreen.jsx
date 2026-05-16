import { ESTADOS_CITA, MODALIDAD, TIPO_ATENCION } from '../../constants/ui'

export function AgendaScreen({
  profesionales,
  selectedProfesionalId,
  setSelectedProfesionalId,
  agendaRange,
  setAgendaRange,
  forms,
  onSetForm,
  citas,
  onLoadAgenda,
  onCreateCita,
  onUpdateEstadoCita,
  onGoDashboard,
  onGoPacientes,
}) {
  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Agenda semanal</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoDashboard}>Dashboard</button>
          <button className="ghost" onClick={onGoPacientes}>Pacientes</button>
          <button className="primary" onClick={onLoadAgenda}>Cargar agenda</button>
        </div>
      </div>

      <div className="card">
        <div className="inline-controls">
          <select value={selectedProfesionalId} onChange={(e) => setSelectedProfesionalId(e.target.value)}>
            <option value="">Profesional</option>
            {profesionales.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
          </select>
          <input value={agendaRange.desde} onChange={(e) => setAgendaRange((prev) => ({ ...prev, desde: e.target.value }))} placeholder="desde ISO" />
          <input value={agendaRange.hasta} onChange={(e) => setAgendaRange((prev) => ({ ...prev, hasta: e.target.value }))} placeholder="hasta ISO" />
        </div>
      </div>

      <div className="card">
        <h4>Nueva cita</h4>
        <form className="form-grid" onSubmit={onCreateCita}>
          <label>Paciente ID<input value={forms.citaCreate.pacienteId} onChange={(e) => onSetForm('citaCreate.pacienteId', e.target.value)} required /></label>
          <label>Profesional ID<input value={forms.citaCreate.profesionalId} onChange={(e) => onSetForm('citaCreate.profesionalId', e.target.value)} required /></label>
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
          <button className="primary full" type="submit">Guardar cita</button>
        </form>
      </div>

      <div className="card">
        <h4>Listado por día/hora</h4>
        <div className="appointments-list">
          {citas.map((c) => (
            <div className="appointment-item" key={c.id}>
              <div className="apt-time">{new Date(c.startsAt).toLocaleString('es-CL')}</div>
              <div className="apt-info"><strong>Cita #{c.id}</strong><p>Paciente #{c.pacienteId} · {c.tipoAtencion}</p></div>
              <select className="apt-estado" value={c.status} onChange={(e) => onUpdateEstadoCita(c.id, e.target.value)}>
                {ESTADOS_CITA.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
