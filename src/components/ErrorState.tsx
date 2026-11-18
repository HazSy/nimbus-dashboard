interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="error-state" role="alert">
      <span className="error-state__icon" aria-hidden="true">
        ⚠
      </span>
      <div>
        <h2>No se han podido cargar los datos</h2>
        <p className="muted">{message}</p>
        <button type="button" className="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
