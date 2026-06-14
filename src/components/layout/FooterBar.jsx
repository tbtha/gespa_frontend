export function FooterBar({ onNavigate }) {
  function handlePoliticasClick(e) {
    e.preventDefault()
    if (onNavigate) {
      onNavigate('politicas')
    }
  }

  return (
    <footer className="footerbar">
      <a href="mailto:contacto@gespa.cl" className="footer-link">
        contacto@gespa.cl
      </a>
      <p className="footer-legend">Gestión clínica profesional</p>
      <a href="#" className="footer-link" onClick={handlePoliticasClick}>
        Políticas y Condiciones de Uso
      </a>
    </footer>
  )
}
