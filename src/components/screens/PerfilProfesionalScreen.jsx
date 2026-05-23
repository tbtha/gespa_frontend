import { useState } from 'react'

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const MODALIDADES = ['PRESENCIAL', 'ONLINE']

const TABS = [
  { id: 'datos', label: 'Datos del perfil' },
  { id: 'horarios', label: 'Horarios de atención' },
]

export function PerfilProfesionalScreen({
  currentUser,
  forms,
  onSetForm,
  onUpdateProfesional,
  horarios,
  onCreateHorario,
  onDeleteHorario,
}) {
  const f = forms.profesionalUpdate
  const [activeTab, setActiveTab] = useState('datos')

  const [horarioForm, setHorarioForm] = useState({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '13:00',
    duracionMinutos: 30,
    modalidad: 'PRESENCIAL',
    lugar: '',
  })

  function setHorarioField(field, value) {
    setHorarioForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleCreateHorario(e) {
    e.preventDefault()
    onCreateHorario({ ...horarioForm })
  }

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Mi perfil</h3>
      </div>

      <div className="admin-tab-bar">
        {TABS.map((tab) => (
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

      {activeTab === 'datos' && (
        <div className="card">
          <h4>Datos del perfil</h4>
          <form className="form-grid" onSubmit={onUpdateProfesional}>
            <label>Correo electrónico<input value={currentUser?.email || ''} disabled /></label>
            <label>Nombre<input value={f.displayName} onChange={(e) => onSetForm('profesionalUpdate.displayName', e.target.value)} required /></label>
            <label>RUT<input value={f.rut || ''} onChange={(e) => onSetForm('profesionalUpdate.rut', e.target.value)} required /></label>
            <label>Especialidad<input value={f.specialty} onChange={(e) => onSetForm('profesionalUpdate.specialty', e.target.value)} required /></label>
            <label>Teléfono<input value={f.phone} onChange={(e) => onSetForm('profesionalUpdate.phone', e.target.value)} /></label>
            <label>Dirección<input value={f.address} onChange={(e) => onSetForm('profesionalUpdate.address', e.target.value)} /></label>
            <label>Institución<input value={f.institucion} onChange={(e) => onSetForm('profesionalUpdate.institucion', e.target.value)} /></label>
            <label className="full">Descripción<input value={f.descripcion} onChange={(e) => onSetForm('profesionalUpdate.descripcion', e.target.value)} /></label>
            <button className="primary full" type="submit">Guardar cambios</button>
          </form>
        </div>
      )}

      {activeTab === 'horarios' && (
        <>
          <div className="card">
            <h4>Agregar horario</h4>
            <p className="meta">Define los bloques de tiempo en que recibirás pacientes. Cada bloque se divide en slots del tamaño de la duración indicada.</p>

            <form className="form-grid" onSubmit={handleCreateHorario} style={{ marginTop: '1rem' }}>
              <label>Día de la semana
                <select value={horarioForm.diaSemana} onChange={(e) => setHorarioField('diaSemana', Number(e.target.value))}>
                  {DIAS.slice(1).map((d, i) => (
                    <option key={i + 1} value={i + 1}>{d}</option>
                  ))}
                </select>
              </label>
              <label>Hora inicio
                <input type="time" value={horarioForm.horaInicio} onChange={(e) => setHorarioField('horaInicio', e.target.value)} required />
              </label>
              <label>Hora fin
                <input type="time" value={horarioForm.horaFin} onChange={(e) => setHorarioField('horaFin', e.target.value)} required />
              </label>
              <label>Duración por cita (min)
                <input type="number" min="10" max="120" step="5" value={horarioForm.duracionMinutos}
                  onChange={(e) => setHorarioField('duracionMinutos', Number(e.target.value))} required />
              </label>
              <label>Modalidad
                <select value={horarioForm.modalidad} onChange={(e) => setHorarioField('modalidad', e.target.value)}>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>{m === 'PRESENCIAL' ? 'Presencial' : 'Online'}</option>
                  ))}
                </select>
              </label>
              {horarioForm.modalidad === 'PRESENCIAL' && (
                <label>Lugar
                  <input type="text" value={horarioForm.lugar} onChange={(e) => setHorarioField('lugar', e.target.value)} placeholder="Ej: Consulta 101, Clínica Central" required />
                </label>
              )}
              <button className="primary" type="submit" style={{ alignSelf: 'flex-end' }}>Agregar horario</button>
            </form>
          </div>

          <div className="card">
            <h4>Mis horarios configurados</h4>
            {(!horarios || horarios.length === 0) ? (
              <p className="meta">Aún no has definido horarios de atención.</p>
            ) : (
              <div className="appointments-list">
                {horarios
                  .slice()
                  .sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))
                  .map((h) => (
                    <div className="appointment-item" key={h.id}>
                      <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 16, alignItems: 'center', flex: '1 1 100%', minWidth: 0, width: '100%' }}>
                        <div className="apt-time" style={{ whiteSpace: 'nowrap', fontSize: '1rem', fontWeight: 600 }}>{DIAS[h.diaSemana] || h.diaSemana} · {h.horaInicio} - {h.horaFin}</div>
                        <span className="apt-status-badge" style={{ background: h.modalidad === 'PRESENCIAL' ? 'var(--primary-light)' : 'var(--info)', color: h.modalidad === 'PRESENCIAL' ? 'var(--primary-dark)' : 'white', marginLeft: 0, whiteSpace: 'nowrap' }}>{h.modalidad === 'PRESENCIAL' ? 'Presencial' : 'Online'}</span>
                        <span style={{ fontWeight: 500, color: h.modalidad === 'PRESENCIAL' ? 'var(--primary)' : '#64748b', whiteSpace: 'nowrap' }}>
                          {h.modalidad === 'PRESENCIAL' ? (h.direccionAtencion || <span style={{ color: '#e11d48' }}>Sin lugar</span>) : '—'}
                        </span>
                        <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{h.duracionMinutos} min</span>
                      </div>
                      <div className="apt-actions">
                        <button className="ghost sm danger" type="button" onClick={() => onDeleteHorario(h.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
