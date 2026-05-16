export function PortalPacienteScreen({ currentUser, hasToken, onRefreshMe }) {
  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Portal del paciente</h3>
        <button className="ghost" onClick={onRefreshMe}>Refrescar /me</button>
      </div>
      <div className="kpi-grid">
        <article className="kpi"><span>Usuario</span><strong>{currentUser?.displayName || '-'}</strong></article>
        <article className="kpi"><span>Email</span><strong>{currentUser?.email || '-'}</strong></article>
        <article className="kpi"><span>Rol</span><strong>{currentUser?.role || '-'}</strong></article>
        <article className="kpi"><span>Token</span><strong>{hasToken ? 'Activo' : 'Sin sesión'}</strong></article>
      </div>
      <div className="card">
        <h4>Resumen ficha (autorizado)</h4>
        <p><strong>Diagnóstico base:</strong> Próxima integración.</p>
        <p><strong>Indicaciones:</strong> Próxima integración.</p>
      </div>
    </section>
  )
}
