import { useEffect, useState } from 'react'

export function PacientesScreen({
  pacienteSearch,
  setPacienteSearch,
  forms,
  onSetForm,
  onSearchPacientes,
  onCreatePaciente,
  pacientes,
  onSelectPaciente,
  onGoDashboard,
  onGoAgenda,
}) {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    onSearchPacientes()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    onSearchPacientes()
  }

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Pacientes</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoDashboard}>Dashboard</button>
          <button className="ghost" onClick={onGoAgenda}>Agenda</button>
          <button className="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Crear paciente'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h4>Nuevo paciente</h4>
          <form className="form-grid" onSubmit={(e) => { onCreatePaciente(e); setShowForm(false) }}>
            <label>Email<input type="email" value={forms.pacienteCreate.email} onChange={(e) => onSetForm('pacienteCreate.email', e.target.value)} required /></label>
            <label>Nombre completo<input value={forms.pacienteCreate.displayName} onChange={(e) => onSetForm('pacienteCreate.displayName', e.target.value)} required /></label>
            <label>RUT<input value={forms.pacienteCreate.rut} onChange={(e) => onSetForm('pacienteCreate.rut', e.target.value)} required /></label>
            <label>Teléfono
              <div className="phone-input">
                <span className="phone-prefix">+569</span>
                <input
                  value={forms.pacienteCreate.phone.replace(/^\+569/, '')}
                  onChange={(e) => onSetForm('pacienteCreate.phone', '+569' + e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
            </label>
            <label>Fecha de nacimiento<input type="date" value={forms.pacienteCreate.birthdate} onChange={(e) => onSetForm('pacienteCreate.birthdate', e.target.value)} /></label>
            <button className="primary full" type="submit">Registrar paciente</button>
          </form>
        </div>
      )}

      <div className="card search-card">
        <form className="inline-controls" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
            value={pacienteSearch}
            onChange={(e) => setPacienteSearch(e.target.value)}
          />
          <button className="ghost" type="submit">Buscar</button>
        </form>
      </div>

      <div className="patient-list">
        {pacientes.length === 0 && <p className="empty-msg">No se encontraron pacientes.</p>}
        {pacientes.map((p) => (
          <article className="patient-item" key={p.id}>
            <div>
              <h4>{p.displayName}</h4>
              <p>{p.rut}</p>
            </div>
            <button className="ghost" onClick={() => onSelectPaciente(p.id)}>Ver ficha</button>
          </article>
        ))}
      </div>
    </section>
  )
}
