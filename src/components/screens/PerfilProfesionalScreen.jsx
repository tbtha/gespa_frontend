export function PerfilProfesionalScreen({
  forms,
  onSetForm,
  onUpdateProfesional,
  onGoDashboard,
  onGoPacientes,
}) {
  const f = forms.profesionalUpdate
  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Mi perfil</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoDashboard}>Dashboard</button>
          <button className="ghost" onClick={onGoPacientes}>Pacientes</button>
        </div>
      </div>

      <div className="card">
        <h4>Datos del perfil</h4>
        <form className="form-grid" onSubmit={onUpdateProfesional}>
          <label>Nombre<input value={f.displayName} onChange={(e) => onSetForm('profesionalUpdate.displayName', e.target.value)} required /></label>
          <label>Especialidad<input value={f.specialty} onChange={(e) => onSetForm('profesionalUpdate.specialty', e.target.value)} required /></label>
          <label>N° Licencia<input value={f.licenseNumber} onChange={(e) => onSetForm('profesionalUpdate.licenseNumber', e.target.value)} /></label>
          <label>Teléfono<input value={f.phone} onChange={(e) => onSetForm('profesionalUpdate.phone', e.target.value)} /></label>
          <label>Dirección<input value={f.address} onChange={(e) => onSetForm('profesionalUpdate.address', e.target.value)} /></label>
          <label>Institución<input value={f.institucion} onChange={(e) => onSetForm('profesionalUpdate.institucion', e.target.value)} /></label>
          <label className="full">Descripción<input value={f.descripcion} onChange={(e) => onSetForm('profesionalUpdate.descripcion', e.target.value)} /></label>
          <button className="primary full" type="submit">Guardar cambios</button>
        </form>
      </div>
    </section>
  )
}
