import { useState } from 'react'
import { toEstadoCitaLabel } from '../../constants/ui'

const TABS = [
  { id: 'datos', label: 'Datos generales' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'notas', label: 'Notas clínicas' },
]

export function FichaScreen({
  selectedPacienteId,
  pacienteActual,
  forms,
  notas,
  citasPaciente,
  antecedentes,
  onSetForm,
  onReloadFicha,
  onSavePacienteGeneral,
  onSaveAntecedentes,
  onCreateNota,
  onGoPacientes,
  onGoAgenda,
  catalogs = {},
}) {
  const previsionOptions = catalogs.previsiones?.length
    ? catalogs.previsiones
    : [{ value: 'FONASA', label: 'FONASA' }, { value: 'ISAPRE', label: 'ISAPRE' }, { value: 'PARTICULAR', label: 'Particular' }]
  const estadoCivilOptions = catalogs.estadosCiviles?.length
    ? catalogs.estadosCiviles
    : [
        { value: 'SOLTERO', label: 'Soltero/a' },
        { value: 'CASADO', label: 'Casado/a' },
        { value: 'CONVIVIENTE', label: 'Conviviente' },
        { value: 'DIVORCIADO', label: 'Divorciado/a' },
        { value: 'VIUDO', label: 'Viudo/a' },
      ]
  const [activeTab, setActiveTab] = useState('datos')
  const citasDisponiblesParaNota = (citasPaciente || []).filter((c) => !['CANCELLED', 'NO_SHOW'].includes(c.status))

  return (
    <section className="screen active">
      <div className="screen-head">
        <div>
          <h3>Ficha del paciente</h3>
          {pacienteActual?.displayName && <p className="meta">Paciente actual: {pacienteActual.displayName}</p>}
        </div>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoAgenda}>Volver a agenda</button>
          <button className="ghost" onClick={onGoPacientes}>Ver listado</button>
          <button className="ghost" onClick={onReloadFicha}>Recargar</button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'datos' && (
        <div className="card">
          {selectedPacienteId ? (
            <form className="form-grid" onSubmit={onSavePacienteGeneral}>
              <label>Email
                <input value={forms.pacienteUpdate.email || ''} disabled />
              </label>
              <label>RUT
                <input value={forms.pacienteUpdate.rut || ''} disabled />
              </label>
              <label>Nombre completo
                <input value={forms.pacienteUpdate.displayName || ''} onChange={(e) => onSetForm('pacienteUpdate.displayName', e.target.value)} required />
              </label>
              <label>Fecha de nacimiento
                <input type="date" value={forms.pacienteUpdate.birthdate || ''} onChange={(e) => onSetForm('pacienteUpdate.birthdate', e.target.value)} />
              </label>
              <label>Género
                <select value={forms.pacienteUpdate.gender || 'FEMENINO'} onChange={(e) => onSetForm('pacienteUpdate.gender', e.target.value)}>
                  <option value="FEMENINO">Femenino</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="NO_BINARIO">No binario</option>
                  <option value="PREFIERE_NO_DECIR">Prefiere no decir</option>
                </select>
              </label>
              <label>Previsión
                <select value={forms.pacienteUpdate.prevision || 'FONASA'} onChange={(e) => onSetForm('pacienteUpdate.prevision', e.target.value)}>
                  {previsionOptions.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
              </label>
              <label>Estado civil
                <select value={forms.pacienteUpdate.estadoCivil || 'SOLTERO'} onChange={(e) => onSetForm('pacienteUpdate.estadoCivil', e.target.value)}>
                  {estadoCivilOptions.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
              </label>
              <label>Ocupación
                <input value={forms.pacienteUpdate.ocupacion || ''} onChange={(e) => onSetForm('pacienteUpdate.ocupacion', e.target.value)} />
              </label>
              <label>Teléfono
                <div className="phone-input">
                  <span className="phone-prefix">+569</span>
                  <input
                    value={(forms.pacienteUpdate.phone || '').replace(/^\+569/, '')}
                    onChange={(e) => onSetForm('pacienteUpdate.phone', '+569' + e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="12345678"
                    maxLength={8}
                  />
                </div>
              </label>
              <label>Dirección
                <input value={forms.pacienteUpdate.address || ''} onChange={(e) => onSetForm('pacienteUpdate.address', e.target.value)} />
              </label>
              <label>Contacto de emergencia
                <input value={forms.pacienteUpdate.emergencyContactName || ''} onChange={(e) => onSetForm('pacienteUpdate.emergencyContactName', e.target.value)} />
              </label>
              <label>Tel. emergencia
                <input value={forms.pacienteUpdate.emergencyContactPhone || ''} onChange={(e) => onSetForm('pacienteUpdate.emergencyContactPhone', e.target.value)} />
              </label>
              <button className="primary full" type="submit">Guardar datos generales</button>
            </form>
          ) : (
            <p>Selecciona un paciente desde la vista Pacientes.</p>
          )}
        </div>
      )}

      {activeTab === 'antecedentes' && (
        <div className="card">
          <h4>Antecedentes clínicos</h4>
          <form className="form-grid" onSubmit={onSaveAntecedentes}>
            <label className="full">Enfermedades base
              <textarea value={forms.antecedente.enfermedadesBase || ''} onChange={(e) => onSetForm('antecedente.enfermedadesBase', e.target.value)} />
            </label>
            <label>Consumo de alcohol
              <select value={forms.antecedente.consumoAlcohol || 'NO_CONSUME'} onChange={(e) => onSetForm('antecedente.consumoAlcohol', e.target.value)}>
                <option value="NO_CONSUME">No consume</option>
                <option value="OCASIONAL">Ocasional</option>
                <option value="FRECUENTE">Frecuente</option>
              </select>
            </label>
            <label>Consumo de tabaco
              <select value={forms.antecedente.consumoTabaco || 'NO_CONSUME'} onChange={(e) => onSetForm('antecedente.consumoTabaco', e.target.value)}>
                <option value="NO_CONSUME">No consume</option>
                <option value="EXFUMADOR">Exfumador</option>
                <option value="ACTIVO">Activo</option>
              </select>
            </label>
            <label>Actividad física
              <select value={forms.antecedente.actividadFisica || 'SEDENTARIO'} onChange={(e) => onSetForm('antecedente.actividadFisica', e.target.value)}>
                <option value="SEDENTARIO">Sedentario</option>
                <option value="LEVE">Leve</option>
                <option value="MODERADO">Moderado</option>
                <option value="INTENSO">Intenso</option>
              </select>
            </label>
            <label className="full">Medicamentos regulares
              <textarea value={forms.antecedente.medicamentosRegulares || ''} onChange={(e) => onSetForm('antecedente.medicamentosRegulares', e.target.value)} />
            </label>
            <label className="full">Otros antecedentes
              <textarea value={forms.antecedente.otrosAntecedentes || ''} onChange={(e) => onSetForm('antecedente.otrosAntecedentes', e.target.value)} />
            </label>
            <button className="primary full" type="submit" disabled={!selectedPacienteId}>Guardar antecedentes</button>
          </form>
          {antecedentes?.updatedAt && <p className="meta">Última actualización: {new Date(antecedentes.updatedAt).toLocaleString('es-CL')}</p>}
        </div>
      )}

      {activeTab === 'notas' && (
        <div className="card">
          <h4>Nueva nota clínica</h4>
          <form className="form-grid" onSubmit={onCreateNota}>
            <label>Hora agendada
              <select
                value={forms.notaCreate.appointmentId}
                onChange={(e) => {
                  const appointmentId = e.target.value
                  onSetForm('notaCreate.appointmentId', appointmentId)
                  const citaSeleccionada = citasDisponiblesParaNota.find((c) => String(c.id) === String(appointmentId))
                  if (citaSeleccionada?.tipoAtencion) {
                    onSetForm('notaCreate.noteType', citaSeleccionada.tipoAtencion)
                  }
                }}
                required
              >
                <option value="">Selecciona una cita</option>
                {citasDisponiblesParaNota.map((c) => (
                  <option key={c.id} value={c.id}>
                    {new Date(c.startsAt).toLocaleString('es-CL')} · {toEstadoCitaLabel(c.status)} · {c.tipoAtencion}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">Contenido
              <textarea value={forms.notaCreate.content} onChange={(e) => onSetForm('notaCreate.content', e.target.value)} required />
            </label>
            <label className="full">Indicaciones
              <textarea value={forms.notaCreate.indicaciones} onChange={(e) => onSetForm('notaCreate.indicaciones', e.target.value)} />
            </label>
            {citasDisponiblesParaNota.length === 0 ? <p className="meta full">No hay horas agendadas disponibles para vincular esta nota.</p> : null}
            <button className="primary full" type="submit" disabled={!selectedPacienteId}>Guardar nota</button>
          </form>

          {notas.length > 0 && (
            <>
              <h4 style={{marginTop: '1.5rem'}}>Notas anteriores</h4>
              {notas.map((n) => (
                <div key={n.id} className="note-item">
                  <strong>{new Date(n.createdAt || Date.now()).toLocaleDateString('es-CL')}</strong>
                  <p>{n.content}</p>
                  {n.indicaciones && <p className="meta">Indicaciones: {n.indicaciones}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

    </section>
  )
}

