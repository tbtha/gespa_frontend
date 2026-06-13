export function LoginRoleSelectorScreen({ onGoPaciente, onGoProfesional, onGoBack }) {
  return (
    <section className="screen active">
      <div className="card role-selector-card">
        <h3>Selecciona tu tipo de ingreso</h3>
        <p>Elige cómo quieres iniciar sesión en GESPA.</p>

        <div className="role-selector-grid">
          <button className="role-option-card" type="button" onClick={onGoPaciente}>
            Paciente
          </button>
          <button className="role-option-card" type="button" onClick={onGoProfesional}>
            Profesional
          </button>
        </div>

        <button className="text-link" type="button" onClick={onGoBack}>
          ← Volver a bienvenida
        </button>
      </div>
    </section>
  )
}
