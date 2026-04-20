export function StatusMessage({ message }) {
  if (!message) return null
  return <div className="msg-box">{message}</div>
}
