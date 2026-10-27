// Regras do jogo, sem React: fáceis de testar.
// Mantém a mecânica original: começa com 10 segundos; cada palavra certa
// soma o número de letras na pontuação e +3 segundos no relógio.

export const START_MS = 10_000;
export const BONUS_MS = 3_000;
export const VISIBLE = 4; // palavras na tela ao mesmo tempo

export const initialState = {
  status: 'idle', // idle | running | paused | over
  remaining: START_MS, // ms restantes (atualizado pelo relógio)
  deadline: 0, // quando o tempo acaba (ms, relógio do navegador)
  score: 0,
  hits: 0,
  longest: '',
  pool: [], // palavras disponíveis; as VISIBLE primeiras ficam na tela
  input: '',
  lastHit: null, // { word, points, id } para o aviso de acerto
};

export const visibleWords = (state) => state.pool.slice(0, VISIBLE);

export function reducer(state, action) {
  switch (action.type) {
    case 'words/add': {
      const seen = new Set(state.pool);
      const fresh = action.words.filter((w) => !seen.has(w) && (seen.add(w), true));
      return fresh.length ? { ...state, pool: [...state.pool, ...fresh] } : state;
    }

    case 'start': {
      if (state.status === 'running') return state;
      if (visibleWords(state).length < VISIBLE) return state;
      const fresh = state.status === 'idle' || state.status === 'over';
      const remaining = fresh ? START_MS : state.remaining;
      return {
        ...state,
        status: 'running',
        remaining,
        deadline: action.now + remaining,
        ...(fresh ? { score: 0, hits: 0, longest: '', input: '', lastHit: null } : {}),
      };
    }

    case 'pause':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused', remaining: Math.max(0, state.deadline - action.now) };

    case 'tick': {
      if (state.status !== 'running') return state;
      const left = Math.max(0, state.deadline - action.now);
      if (left === 0) return { ...state, status: 'over', remaining: 0, input: '' };
      // A tela mostra décimos de segundo: só muda o estado quando o décimo muda
      const remaining = Math.ceil(left / 100) * 100;
      return remaining === state.remaining ? state : { ...state, remaining };
    }

    case 'type': {
      if (state.status !== 'running') return state;
      const input = action.value.toLowerCase().replace(/\s/g, '');
      // Só valem as palavras que estão na tela
      const word = visibleWords(state).find((w) => w === input);
      if (!word) return { ...state, input };
      const points = word.length;
      return {
        ...state,
        input: '',
        score: state.score + points,
        hits: state.hits + 1,
        longest: word.length > state.longest.length ? word : state.longest,
        deadline: state.deadline + BONUS_MS,
        remaining: Math.max(0, state.deadline + BONUS_MS - action.now),
        pool: state.pool.filter((w) => w !== word),
        lastHit: { word, points, id: state.hits + 1 },
      };
    }

    case 'reset':
      return { ...initialState, pool: action.pool ?? state.pool };

    default:
      return state;
  }
}

/** Quantas letras do começo de `word` batem com o que foi digitado. */
export function matchInfo(word, input) {
  if (!input) return { ok: 0, wrong: false };
  let ok = 0;
  while (ok < input.length && ok < word.length && word[ok] === input[ok]) ok++;
  return { ok, wrong: ok < input.length };
}
