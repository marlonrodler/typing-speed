// Recorde pessoal guardado só neste navegador.
const KEY = 'typing-speed:best';

export function loadBest() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    /* navegação privada: o recorde vale só nesta visita */
  }
}
