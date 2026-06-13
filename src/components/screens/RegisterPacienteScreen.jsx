export function RegisterPacienteScreen({ registerForm, onSetRegisterForm, onSubmit, onGoLoginPaciente, isExistingUser, hasPatientProfile = false }) {
  return (
    <section className="screen active">
      <div className="card login-card">
        <h3>Registro paciente</h3>
        <p>
          {hasPatientProfile
            ? 'Este correo ya tiene perfil de paciente. Inicia sesión para continuar.'
            : isExistingUser
              ? 'Agrega tu perfil de paciente a tu cuenta existente.'
              : 'Crea tu cuenta de paciente para acceder al portal.'}
        </p>
        <form onSubmit={onSubmit}>
          <label>Correo</label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={registerForm.email}
            onChange={(e) => onSetRegisterForm('email', e.target.value)}
            required
            readOnly={isExistingUser}
          />
          <label>Nombre para mostrar</label>
          <input
            placeholder="Juan Pérez González"
            value={registerForm.displayName}
            onChange={(e) => onSetRegisterForm('displayName', e.target.value)}
            required
          />
          <label>RUT</label>
          <input
            placeholder="12345678-9"
            value={registerForm.rut}
            onChange={(e) => onSetRegisterForm('rut', e.target.value)}
            required
          />
          {!isExistingUser && (
            <>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                value={registerForm.password}
                onChange={(e) => onSetRegisterForm('password', e.target.value)}
                required
              />
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                minLength={8}
                value={registerForm.confirmPassword}
                onChange={(e) => onSetRegisterForm('confirmPassword', e.target.value)}
                required
              />
            </>
          )}
          <button className="primary" type="submit" disabled={hasPatientProfile}>
            {hasPatientProfile ? 'Ya registrado' : 'Crear cuenta'}
          </button>
        </form>
        <div className="login-switch">
          <span>¿Ya tienes cuenta?</span>
          <button className="ghost" type="button" onClick={onGoLoginPaciente}>Ir al login paciente</button>
        </div>
      </div>
    </section>
  )
}
