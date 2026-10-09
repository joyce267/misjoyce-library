export default function FormError({ message }) {
  return message ? <div className="form-error">{message}</div> : null;
}
