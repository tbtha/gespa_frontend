import { ESTADOS_CITA } from '../../constants/ui'

export function DashboardScreen({
  onLoadDashboard,
  dashboard,
  onUpdateEstadoCita,
  onGoPerfil,
  onGoPacientes,
  onGoAgenda,
}) {
  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Dashboard</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoPerfil}>Mi perfil</button>
          <button className="ghost" onClick={onGoPacientes}>Pacientes</button>
          <button className="ghost" onClick={onGoAgenda}>Agenda</button>
          <button className="primary" onClick={onLoadDashboard}>Actualizar</button>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="kpi-grid">
            <article className="kpi"><span>Pacientes activos</span><strong>{dashboard.kpis?.pacientesActivos}</strong></article>
            <article className="kpi"><span>Citas hoy</span><strong>{dashboard.kpis?.citasHoy}</strong></article>
            <article className="kpi"><span>% completadas</span><strong>{dashboard.kpis?.porcentajeCompletadas}</strong></article>
            <article className="kpi"><span>% ausentismo</span><strong>{dashboard.kpis?.porcentajeAusentismo}</strong></article>
          </div>
          <div className="card">
            <h4>Citas próximas (hoy y mañana)</h4>
            <div className="appointments-list">
              {dashboard.citasProximas?.map((c) => (
                <div className="appointment-item" key={c.citaId}>
                  <div className="apt-time">{new Date(c.startsAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="apt-info"><strong>{c.pacienteNombre}</strong><p>{c.tipoAtencion}</p></div>
                  <select className="apt-estado" value={c.status} onChange={(e) => onUpdateEstadoCita(c.citaId, e.target.value)}>
                    {ESTADOS_CITA.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
