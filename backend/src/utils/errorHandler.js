export function handleError(res, err, defaultMessage = 'Internal Server Error', statusCode = 500) {
  console.error('[Error]:', err.message || err);
  
  // If the error has a specific status code attached, use it
  const code = err.statusCode || statusCode;
  const message = err.message || defaultMessage;
  
  return res.status(code).json({ error: message });
}
