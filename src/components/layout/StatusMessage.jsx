export function StatusMessage({ message, onClose }) {
  if (!message) return null

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div
        className={`status-modal status-modal--${message.type}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
      >
        <button className="status-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        <p className="status-modal__message">{message.text}</p>
      </div>
    </div>
  )
}
