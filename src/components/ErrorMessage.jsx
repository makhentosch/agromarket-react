// Ошибка формы: общий текст и, если сервер прислал details, ошибки по полям
function ErrorMessage({ error }) {
  if (!error) {
    return null;
  }
  const details = error.details ?? [];

  return (
    <div className="error" role="alert">
      {details.length > 0 ? (
        <ul className="error-list">
          {details.map((d) => (
            <li key={`${d.field}-${d.message}`}>{d.message}</li>
          ))}
        </ul>
      ) : (
        error.message
      )}
    </div>
  );
}

export default ErrorMessage;
