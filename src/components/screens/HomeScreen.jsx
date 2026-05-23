import { useEffect } from 'react'
import medicineIllustration from '../../assets/undraw_medicine_hqqg.svg?url'

export function HomeScreen({ onGoLogin }) {
  useEffect(() => {
    document.title = 'GESPA - Bienvenida'
  }, [])

  return (
    <section className="screen active">
      <div className="card login-card" style={{ textAlign: 'center' }}>
        <img src={medicineIllustration} alt="Ilustración bienvenida GESPA" style={{ width: '100%', maxWidth: 220, height: 'auto', margin: '0 auto 18px auto', display: 'block', borderRadius: 12, boxShadow: '0 2px 16px #4361ee11' }} />
        <h3 style={{ fontSize: '2.1rem', color: 'var(--primary)', margin: '0 0 10px 0', fontWeight: 700, letterSpacing: '-1px' }}>Bienvenido</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.13rem', margin: '0 0 22px 0', lineHeight: 1.5 }}>
          ¡Te damos la bienvenida a <span style={{ color: 'var(--primary)', fontWeight: 600 }}>GESPA</span>!<br/>
          Plataforma digital para la gestión clínica y agendamiento de horas con profesionales de la salud.
        </p>
        <button
          className="primary"
          onClick={onGoLogin}
        >
          Iniciar sesión
        </button>
      </div>
    </section>
  )
}