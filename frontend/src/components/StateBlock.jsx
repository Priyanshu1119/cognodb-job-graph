export function Loading({ label = "loading" }) {
  return <div className="loading-state">// {label}...</div>;
}

export function ErrorBlock({ message }) {
  return (
    <div className="error-state">
      <strong>Something didn't connect.</strong>
      <div style={{ marginTop: 6 }}>{message}</div>
    </div>
  );
}

export function Empty({ message }) {
  return <div className="empty-state">{message}</div>;
}
