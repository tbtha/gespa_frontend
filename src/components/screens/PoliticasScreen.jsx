export function PoliticasScreen() {
  return (
    <div className="politicas-screen">
      <div className="politicas-container">
        <h1>Políticas y Condiciones de Uso</h1>
        <p className="ultima-actualizacion">Última actualización: Junio 2026</p>

        <section className="politicas-section">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar GESPA (Gestión de Pacientes), usted acepta estar sujeto a estas 
            políticas y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, 
            no podrá acceder al sistema.
          </p>
        </section>

        <section className="politicas-section">
          <h2>2. Descripción del Servicio</h2>
          <p>
            GESPA es una plataforma de gestión clínica que permite a profesionales de la salud 
            administrar información de pacientes, agendar citas, registrar antecedentes médicos 
            y llevar un seguimiento de la evolución clínica.
          </p>
        </section>

        <section className="politicas-section">
          <h2>3. Privacidad y Protección de Datos</h2>
          <p>
            Nos comprometemos a proteger la privacidad de los datos personales y de salud 
            almacenados en nuestra plataforma. Los datos son tratados conforme a la normativa 
            vigente de protección de datos personales.
          </p>
          <ul>
            <li>Los datos clínicos son confidenciales y solo accesibles por personal autorizado.</li>
            <li>No compartimos información personal con terceros sin consentimiento expreso.</li>
            <li>Implementamos medidas de seguridad para proteger la información almacenada.</li>
          </ul>
        </section>

        <section className="politicas-section">
          <h2>4. Responsabilidades del Usuario</h2>
          <p>Al utilizar GESPA, usted se compromete a:</p>
          <ul>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>No compartir su cuenta con terceros.</li>
            <li>Utilizar el sistema únicamente para fines profesionales legítimos.</li>
            <li>Reportar cualquier uso no autorizado de su cuenta.</li>
            <li>Mantener actualizada su información de contacto.</li>
          </ul>
        </section>

        <section className="politicas-section">
          <h2>5. Uso Apropiado del Sistema</h2>
          <p>Queda prohibido:</p>
          <ul>
            <li>Intentar acceder a datos de otros usuarios sin autorización.</li>
            <li>Utilizar el sistema para fines ilegales o no autorizados.</li>
            <li>Introducir virus, malware o código malicioso.</li>
            <li>Realizar ingeniería inversa del software.</li>
            <li>Sobrecargar intencionalmente los servidores del sistema.</li>
          </ul>
        </section>

        <section className="politicas-section">
          <h2>6. Propiedad Intelectual</h2>
          <p>
            Todo el contenido, diseño, código y funcionalidades de GESPA son propiedad 
            exclusiva de sus desarrolladores. Queda prohibida la reproducción, distribución 
            o modificación sin autorización expresa.
          </p>
        </section>

        <section className="politicas-section">
          <h2>7. Limitación de Responsabilidad</h2>
          <p>
            GESPA se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos 
            responsables de:
          </p>
          <ul>
            <li>Interrupciones temporales del servicio por mantenimiento.</li>
            <li>Pérdida de datos debido a factores fuera de nuestro control.</li>
            <li>Decisiones clínicas tomadas basándose en la información del sistema.</li>
          </ul>
        </section>

        <section className="politicas-section">
          <h2>8. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estas políticas en cualquier momento. 
            Los cambios serán notificados a través del sistema y entrarán en vigor 
            inmediatamente después de su publicación.
          </p>
        </section>

        <section className="politicas-section">
          <h2>9. Contacto</h2>
          <p>
            Para consultas sobre estas políticas o el uso del sistema, puede contactarnos 
            a través de los canales oficiales de soporte.
          </p>
        </section>
      </div>
    </div>
  )
}
