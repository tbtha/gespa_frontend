export function LoginProfesionalScreen({ auth, setAuthState, onSubmit, onGoPaciente }) {
  return (
    <section className="screen active">
      <div className="card login-card">
        <h3>Ingreso profesional</h3>
        <p>Acceso seguro para profesionales de salud.</p>
        <form onSubmit={onSubmit}>
          <label>Correo</label>
          <input type="email" value={auth.email} onChange={(e) => setAuthState((p) => ({ ...p, email: e.target.value }))} required />
          <label>Contraseña</label>
          <input type="password" value={auth.password} onChange={(e) => setAuthState((p) => ({ ...p, password: e.target.value }))} required />
          <button className="primary" type="submit">Ingresar</button>
        </form>
        <div className="login-switch">
          <span>¿Eres paciente?</span>
          <button className="ghost" type="button" onClick={onGoPaciente}>Ingresar como paciente</button>
        </div>
      </div>
    </section>
  )
}
