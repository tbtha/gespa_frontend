import { useEffect } from 'react'
import medicineIllustration from '../../assets/undraw_medicine_hqqg.svg?url'

export function HomeScreen({ onGoLogin, especialidades = [] }) {
  useEffect(() => {
    document.title = 'GESPA - Bienvenida'
  }, [])

  return (
    <section className="screen active">
      <div className="card login-card" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
        <img src={medicineIllustration} alt="Ilustración bienvenida GESPA" style={{ width: '100%', maxWidth: 220, height: 'auto', margin: '0 auto 18px auto', display: 'block', borderRadius: 12, boxShadow: '0 2px 16px #4361ee11' }} />
        <h2 style={{ fontSize: '2.1rem', color: 'var(--primary)', margin: '0 0 10px 0', fontWeight: 700, letterSpacing: '-1px' }}>Bienvenido</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.13rem', margin: '0 0 18px 0', lineHeight: 1.5 }}>
          Somos una red de profesionales independientes de la salud mental y el bienestar. Cada especialista ofrece atención personalizada y de calidad, adaptada a tus necesidades y las de tu familia.
        </p>
        <h3 style={{ color: 'var(--primary)', margin: '18px 0 8px 0', fontWeight: 600 }}>Especialidades disponibles</h3>
        {especialidades.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {especialidades.map((esp) => (
              <li key={esp} style={{ background: '#e9ecef', borderRadius: 8, padding: '4px 12px', margin: 2, fontSize: '1rem', color: '#222' }}>{esp}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#888', fontSize: '1rem' }}>Cargando especialidades...</p>
        )}
        <button
          className="primary"
          onClick={onGoLogin}
          style={{ marginTop: 16 }}
        >
          Iniciar sesión y agendar
        </button>
      </div>
    </section>
  )
}