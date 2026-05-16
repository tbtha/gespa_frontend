import { useState } from 'react'
import { TIPO_INDICADOR } from '../../constants/ui'

const TABS = [
  { id: 'datos', label: 'Datos generales' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'notas', label: 'Notas clínicas' },
  { id: 'evolucion', label: 'Evolución' },
]

const INDICADOR_LABEL = {
  PESO: 'Peso',
  PRESION_SISTOLICA: 'Presión sistólica',
  GLICEMIA: 'Glicemia',
  OTRO: 'Otro',
}

const INDICADOR_UNIDAD_SUGERIDA = {
  PESO: 'kg',
  PRESION_SISTOLICA: 'mmHg',
  GLICEMIA: 'mg/dL',
  OTRO: '',
}

export function FichaScreen({
  selectedPacienteId,
  pacienteActual,
  forms,
  notas,
  antecedentes,
  evolucion,
  serieEvolucion,
  onSetForm,
  onReloadFicha,
  onSavePacienteGeneral,
  onSaveAntecedentes,
  onCreateNota,
  onSaveEvolucion,
  onLoadSerieEvolucion,
  onGoPacientes,
  onGoAgenda,
}) {
  const [activeTab, setActiveTab] = useState('datos')

  return (
    <section className="screen active">
      <div className="screen-head">
        <h3>Ficha del paciente</h3>
        <div className="inline-controls">
          <button className="ghost" onClick={onGoPacientes}>Pacientes</button>
          <button className="ghost" onClick={onGoAgenda}>Agenda</button>
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
                  <option value="FONASA">FONASA</option>
                  <option value="ISAPRE">ISAPRE</option>
                  <option value="PARTICULAR">Particular</option>
                </select>
              </label>
              <label>Estado civil
                <select value={forms.pacienteUpdate.estadoCivil || 'SOLTERO'} onChange={(e) => onSetForm('pacienteUpdate.estadoCivil', e.target.value)}>
                  <option value="SOLTERO">Soltero/a</option>
                  <option value="CASADO">Casado/a</option>
                  <option value="CONVIVIENTE">Conviviente</option>
                  <option value="DIVORCIADO">Divorciado/a</option>
                  <option value="VIUDO">Viudo/a</option>
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
            <label>ID de la cita<input type="number" value={forms.notaCreate.appointmentId} onChange={(e) => onSetForm('notaCreate.appointmentId', e.target.value)} required /></label>
            <label>Tipo de nota
              <select value={forms.notaCreate.noteType} onChange={(e) => onSetForm('notaCreate.noteType', e.target.value)}>
                <option value="CONTROL">Control</option>
                <option value="PRIMERA_CONSULTA">Primera consulta</option>
                <option value="URGENCIA">Urgencia</option>
                <option value="SEGUIMIENTO">Seguimiento</option>
              </select>
            </label>
            <label className="full">Contenido
              <textarea value={forms.notaCreate.content} onChange={(e) => onSetForm('notaCreate.content', e.target.value)} required />
            </label>
            <label className="full">Indicaciones
              <textarea value={forms.notaCreate.indicaciones} onChange={(e) => onSetForm('notaCreate.indicaciones', e.target.value)} />
            </label>
            <button className="primary full" type="submit" disabled={!selectedPacienteId}>Guardar nota</button>
          </form>

          {notas.length > 0 && (
            <>
              <h4 style={{marginTop: '1.5rem'}}>Notas anteriores</h4>
              {notas.map((n) => (
                <div key={n.id} className="note-item">
                  <strong>{n.noteType} · {new Date(n.createdAt || Date.now()).toLocaleDateString('es-CL')}</strong>
                  <p>{n.content}</p>
                  {n.indicaciones && <p className="meta">Indicaciones: {n.indicaciones}</p>}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'evolucion' && (
        <div className="card">
          <h4>Seguimiento de evolución</h4>
          <p className="meta">Registra mediciones clínicas para ver la evolución del paciente en el tiempo.</p>
          <form className="form-grid" onSubmit={onSaveEvolucion}>
            <label>Tipo de medición
              <select
                value={forms.evolucionCreate.tipoIndicador}
                onChange={(e) => {
                  const tipo = e.target.value
                  onSetForm('evolucionCreate.tipoIndicador', tipo)
                  onSetForm('evolucionCreate.unidad', INDICADOR_UNIDAD_SUGERIDA[tipo] || '')
                }}
              >
                {TIPO_INDICADOR.map((it) => <option key={it} value={it}>{INDICADOR_LABEL[it] || it}</option>)}
              </select>
            </label>
            <label>Resultado
              <input value={forms.evolucionCreate.valor} onChange={(e) => onSetForm('evolucionCreate.valor', e.target.value)} required />
            </label>
            <label>Unidad
              <input value={forms.evolucionCreate.unidad} onChange={(e) => onSetForm('evolucionCreate.unidad', e.target.value)} placeholder="Ej: kg, mmHg, mg/dL" />
            </label>
            <label>Fecha de registro
              <input type="date" value={forms.evolucionCreate.fechaRegistro} onChange={(e) => onSetForm('evolucionCreate.fechaRegistro', e.target.value)} required />
            </label>
            <button className="primary full" type="submit" disabled={!selectedPacienteId}>Guardar medición</button>
          </form>

          {evolucion.length > 0 && (
            <>
              <h4 style={{marginTop: '1.5rem'}}>Historial de mediciones</h4>
              <ul className="evolucion-list">
                {evolucion.map((r) => (
                  <li key={r.id}>{new Date(r.fechaRegistro).toLocaleDateString('es-CL')} · <strong>{INDICADOR_LABEL[r.tipoIndicador] || r.tipoIndicador}</strong> · {r.valor} {r.unidad}</li>
                ))}
              </ul>
            </>
          )}

          <div style={{marginTop: '1.5rem'}}>
            <h4>Filtrar evolución (opcional)</h4>
            <div className="inline-controls">
              <select value={forms.evolucionSerie.tipo} onChange={(e) => onSetForm('evolucionSerie.tipo', e.target.value)}>
                {TIPO_INDICADOR.map((it) => <option key={it} value={it}>{INDICADOR_LABEL[it] || it}</option>)}
              </select>
              <input type="date" value={forms.evolucionSerie.desde} onChange={(e) => onSetForm('evolucionSerie.desde', e.target.value)} />
              <input type="date" value={forms.evolucionSerie.hasta} onChange={(e) => onSetForm('evolucionSerie.hasta', e.target.value)} />
              <button className="ghost" type="button" onClick={onLoadSerieEvolucion}>Aplicar filtro</button>
            </div>
            {serieEvolucion.length > 0 && <p className="meta">Se encontraron {serieEvolucion.length} registros.</p>}
          </div>
        </div>
      )}
    </section>
  )
}

