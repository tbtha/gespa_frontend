import { useState } from 'react'

function InviteFlowBanner({ steps }) {
  return (
    <div className="invite-flow-banner">
      {steps.map((step, i) => (
        <div key={i} className="invite-flow-step">
          <div className="invite-flow-num">{i + 1}</div>
          <span>{step}</span>
          {i < steps.length - 1 && <div className="invite-flow-arrow">→</div>}
        </div>
      ))}
    </div>
  )
}

function FormField({ label, hint, children, full }) {
  return (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label className="field-label">{label}</label>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {children}
    </div>
  )
}

export function AdminScreen({
  inviteForm,
  specialtyOptions,
  adminSpecialties,
  adminNewSpecialtyName,
  onSetInviteForm,
  onSetAdminNewSpecialty,
  onCreateAdminSpecialty,
  onToggleAdminSpecialty,
  onCreateInvitation,
  patientInviteForm,
  onSetPatientInviteForm,
  onCreatePatientInvitation,
  users,
  onReloadUsers,
  onToggleUser,
  onResetPassword,
}) {
  const [activeTab, setActiveTab] = useState('users')
  const noSpecialties = !specialtyOptions || specialtyOptions.length === 0

  function getRoleBadges(user) {
    const badges = []
    const hasProfessional = user?.hasProfessionalProfile ?? (user?.role === 'PROFESSIONAL')
    const hasPatient = user?.hasPatientProfile ?? (user?.role === 'PATIENT')

    if (user?.role === 'ADMIN') {
      badges.push({ key: 'ADMIN', label: 'ADMIN', className: 'role-badge--admin' })
    }
    if (hasProfessional) {
      badges.push({ key: 'PROFESSIONAL', label: 'PROFESSIONAL', className: 'role-badge--professional' })
    }
    if (hasPatient) {
      badges.push({ key: 'PATIENT', label: 'PATIENT', className: 'role-badge--patient' })
    }
    if (badges.length === 0 && user?.role) {
      badges.push({ key: user.role, label: user.role, className: `role-badge--${String(user.role).toLowerCase()}` })
    }
    return badges
  }

  function hasDualProfile(user) {
    const hasProfessional = user?.hasProfessionalProfile ?? false
    const hasPatient = user?.hasPatientProfile ?? false
    return hasProfessional && hasPatient
  }

  const tabs = [
    { id: 'users', label: 'Usuarios' },
    { id: 'professional', label: 'Nuevo profesional' },
    { id: 'patient', label: 'Nuevo paciente' },
    { id: 'specialties', label: 'Especialidades' },
  ]

  return (
    <section className="screen active">
      <div className="screen-head">
        <div>
          <h3>Panel administrador</h3>
          <p className="meta">Gestión de usuarios y catálogos del sistema</p>
        </div>
        <button className="ghost" onClick={onReloadUsers}>Actualizar</button>
      </div>

      <div className="admin-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'professional' && (
        <div className="invite-layout">
          <div className="card invite-main-card">
            <div className="invite-card-header">
              <div>
                <h4>Registrar profesional de salud</h4>
                <p className="meta">Se crea usuario y se enviará un token de invitación para que active su cuenta.</p>
              </div>
            </div>

            <InviteFlowBanner steps={[
              'Completa los datos',
              'Se crea ficha',
              'Se genera token',
              'Acepta invitación',
              'Accede al portal',
            ]} />

            <form onSubmit={onCreateInvitation} className="invite-form">
              <div className="form-row">
                <FormField label="Correo electrónico" hint="Usado para iniciar sesión">
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => onSetInviteForm('email', e.target.value)}
                    placeholder="correo@clinica.cl"
                    required
                  />
                </FormField>

                <FormField label="Nombre completo" hint="Visible en el sistema">
                  <input
                    value={inviteForm.displayName}
                    onChange={(e) => onSetInviteForm('displayName', e.target.value)}
                    placeholder="Dr. Juan Pérez"
                    required
                  />
                </FormField>
              </div>

              <div className="form-row">
                <FormField label="RUT" hint="Ej: 12.345.678-9">
                  <input
                    value={inviteForm.rut || ''}
                    onChange={(e) => onSetInviteForm('rut', e.target.value)}
                    placeholder="12.345.678-9"
                    required
                  />
                </FormField>

                <FormField label="Especialidad" hint="Del catálogo activo">
                  {noSpecialties ? (
                    <div className="field-warning">
                      No hay especialidades activas. Agrega una en la pestaña Especialidades.
                    </div>
                  ) : (
                    <select
                      value={inviteForm.specialty}
                      onChange={(e) => onSetInviteForm('specialty', e.target.value)}
                      required
                    >
                      <option value="" disabled>Selecciona una especialidad</option>
                      {specialtyOptions.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </FormField>
              </div>

              <button className="primary invite-submit-btn" type="submit" disabled={noSpecialties}>
                Crear invitación profesional
              </button>
            </form>
          </div>

          <div className="invite-side-info">
            <div className="card">
              <h5>Después de crear</h5>
              <ul className="info-list">
                <li>Se crea usuario con rol profesional en estado inactivo.</li>
                <li>Se crea el perfil profesional con la especialidad seleccionada.</li>
                <li>Se genera token válido por 7 días.</li>
                <li>Token visible en el mensaje de éxito.</li>
                <li>El profesional activa su cuenta con ese token.</li>
              </ul>
            </div>
            <div className="card">
              <h5>Especialidades disponibles</h5>
              {noSpecialties ? (
                <p className="meta">No hay especialidades activas.</p>
              ) : (
                <div className="specialty-chips">
                  {specialtyOptions.map((s) => (
                    <span key={s.id} className="specialty-chip">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patient' && (
        <div className="invite-layout">
          <div className="card invite-main-card">
            <div className="invite-card-header">
              <div>
                <h4>Registrar paciente</h4>
                <p className="meta">Se crea usuario y se enviará un token de invitación para que active su cuenta.</p>
              </div>
            </div>

            <InviteFlowBanner steps={[
              'Completa los datos',
              'Se crea ficha',
              'Se genera token',
              'Acepta invitación',
              'Accede al portal',
            ]} />

            <form onSubmit={onCreatePatientInvitation} className="invite-form">
              <div className="form-row">
                <FormField label="Correo electrónico" hint="Usado para iniciar sesión">
                  <input
                    type="email"
                    value={patientInviteForm.email}
                    onChange={(e) => onSetPatientInviteForm('email', e.target.value)}
                    placeholder="paciente@email.com"
                    required
                  />
                </FormField>

                <FormField label="Nombre completo" hint="Visible en la ficha">
                  <input
                    value={patientInviteForm.displayName}
                    onChange={(e) => onSetPatientInviteForm('displayName', e.target.value)}
                    placeholder="María González"
                    required
                  />
                </FormField>
              </div>

              <div className="form-row-single">
                <FormField label="RUT" hint="Ej: 12.345.678-9">
                  <input
                    value={patientInviteForm.rut}
                    onChange={(e) => onSetPatientInviteForm('rut', e.target.value)}
                    placeholder="12.345.678-9"
                    required
                  />
                </FormField>
              </div>

              <button className="primary invite-submit-btn" type="submit">
                Crear paciente e invitación
              </button>
            </form>
          </div>

          <div className="invite-side-info">
            <div className="card">
              <h5>Después de crear</h5>
              <ul className="info-list">
                <li>Se crea usuario con rol paciente en estado inactivo.</li>
                <li>Se crea una ficha inicial de paciente (mínima).</li>
                <li>Se genera token válido por 7 días.</li>
                <li>El paciente activa su cuenta con ese token.</li>
                <li>Luego puede entrar a su portal.</li>
              </ul>
            </div>
            <div className="card">
              <h5>Datos requeridos</h5>
              <ul className="info-list">
                <li><strong>Correo:</strong> único en el sistema</li>
                <li><strong>Nombre:</strong> visible en ficha</li>
                <li><strong>RUT:</strong> identificación del paciente</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="users-list-header">
            <h4>Usuarios del sistema</h4>
            <span className="users-count">{users.length} usuario{users.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="appointments-list admin-users-list">
            {users.map((u) => (
              <div key={u.userId} className="appointment-item">
                <div className="apt-time">
                  <div className="role-badges">
                    {getRoleBadges(u).map((badge) => (
                      <span key={badge.key} className={`role-badge ${badge.className}`}>{badge.label}</span>
                    ))}
                  </div>
                </div>
                <div className="apt-info">
                  <strong>{u.displayName}</strong>
                  <p>{u.email}</p>
                  {hasDualProfile(u) ? <p><strong>Doble perfil:</strong> Profesional y Paciente</p> : null}
                </div>
                <div className="inline-controls">
                  {u.active ? (
                    <button className="ghost btn-danger-ghost" onClick={() => onToggleUser(u)}>
                      Desactivar
                    </button>
                  ) : (
                    <span className={`status-pill ${u.invitationPending ? 'status-pill--pending' : 'status-pill--inactive'}`}>
                      {u.invitationPending ? 'Invitación pendiente' : 'Inactivo'}
                    </span>
                  )}
                  <button className="ghost" onClick={() => onResetPassword(u.userId)}>
                    Reset clave
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 ? (
              <p className="meta" style={{ textAlign: 'center', padding: '24px 0' }}>No hay usuarios registrados.</p>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === 'specialties' && (
        <>
          <div className="card">
            <h4>Agregar especialidad</h4>
            <form onSubmit={onCreateAdminSpecialty} className="specialty-add-form">
              <input
                value={adminNewSpecialtyName}
                onChange={(e) => onSetAdminNewSpecialty(e.target.value)}
                placeholder="Ej: Otorrinolaringología"
                required
              />
              <button className="primary" type="submit">+ Guardar</button>
            </form>
          </div>

          <div className="card">
            <div className="users-list-header">
              <h4>Catálogo de especialidades</h4>
              <span className="users-count">{(adminSpecialties || []).length} especialidad{(adminSpecialties || []).length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="appointments-list">
              {(adminSpecialties || []).map((s) => (
                <div key={s.id} className="appointment-item">
                  <div className="apt-time">
                    <span className={`status-pill ${s.active ? 'status-pill--active' : 'status-pill--inactive'}`}>
                      {s.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="apt-info">
                    <strong>{s.name}</strong>
                  </div>
                  <div className="inline-controls">
                    <button
                      className={s.active ? 'ghost btn-danger-ghost' : 'ghost btn-success-ghost'}
                      onClick={() => onToggleAdminSpecialty(s)}
                    >
                      {s.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
