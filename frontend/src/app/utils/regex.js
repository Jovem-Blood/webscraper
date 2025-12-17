export function extrairMLB(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const match = texto.match(/MLB-?(\d+)/i);
  if (!match) return null;
  return `MLB${match[1]}`;
}