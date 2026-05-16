export function LoginPacienteScreen({ auth, setAuthState, onSubmit, onGoProfesional }) {
  return (
    <section className="screen active">
      <div className="card login-card">
        <h3>Ingreso paciente</h3>
        <p>Acceso a datos autorizados de su ficha y próximas citas.</p>
        <form onSubmit={onSubmit}>
          <label>Correo</label>
          <input type="email" value={auth.email} onChange={(e) => setAuthState((p) => ({ ...p, email: e.target.value }))} required />
          <label>Contraseña</label>
          <input type="password" value={auth.password} onChange={(e) => setAuthState((p) => ({ ...p, password: e.target.value }))} required />
          <button className="primary" type="submit">Ingresar</button>
        </form>
        <div className="login-switch">
          <span>¿Eres profesional?</span>
          <button className="ghost" type="button" onClick={onGoProfesional}>Ingresar como profesional</button>
        </div>
      </div>
    </section>
  )
}
