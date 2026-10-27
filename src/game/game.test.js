import { describe, expect, it } from 'vitest';
import { BONUS_MS, START_MS, initialState, matchInfo, reducer, visibleWords } from './reducer';
import { FALLBACK_WORDS, acceptWord } from './words';

const withWords = (words) => reducer(initialState, { type: 'words/add', words });
const started = (words = ['casa', 'janela', 'rio', 'barco', 'pedra']) =>
  reducer(withWords(words), { type: 'start', now: 0 });

describe('palavras aceitas', () => {
  it('segue as regras do original: sem espaço e sem acento', () => {
    expect(acceptWord('Casa')).toBe('casa');
    expect(acceptWord('carta-lege')).toBe('carta-lege');
    expect(acceptWord('maçã')).toBeNull();
    expect(acceptWord('pé de moleque')).toBeNull();
    expect(acceptWord('')).toBeNull();
    expect(acceptWord(undefined)).toBeNull();
  });

  it('a lista reserva só tem palavras válidas e sem repetição', () => {
    expect(FALLBACK_WORDS.length).toBeGreaterThan(150);
    expect(new Set(FALLBACK_WORDS).size).toBe(FALLBACK_WORDS.length);
    FALLBACK_WORDS.forEach((w) => expect(acceptWord(w)).toBe(w));
  });
});

describe('regras do jogo', () => {
  it('não aceita palavra repetida no estoque', () => {
    const s = reducer(withWords(['casa', 'rio']), { type: 'words/add', words: ['rio', 'mar'] });
    expect(s.pool).toEqual(['casa', 'rio', 'mar']);
  });

  it('só começa com 4 palavras na tela', () => {
    expect(reducer(withWords(['a1', 'b2']), { type: 'start', now: 0 }).status).toBe('idle');
    expect(started().status).toBe('running');
    expect(started().remaining).toBe(START_MS);
  });

  it('palavra certa soma as letras e +3 segundos', () => {
    const s = reducer(started(), { type: 'type', value: 'JANELA', now: 1000 });
    expect(s.score).toBe(6);
    expect(s.hits).toBe(1);
    expect(s.deadline).toBe(START_MS + BONUS_MS);
    expect(s.input).toBe('');
    expect(s.pool).not.toContain('janela');
    expect(visibleWords(s)).toContain('pedra'); // a próxima palavra entra na tela
  });

  it('palavra fora da tela não vale (corrige o original)', () => {
    const s = reducer(started(), { type: 'type', value: 'pedra', now: 0 });
    expect(s.score).toBe(0);
    expect(s.input).toBe('pedra');
  });

  it('o tempo acaba e o jogo termina com a pontuação mantida', () => {
    let s = reducer(started(), { type: 'type', value: 'casa', now: 0 });
    s = reducer(s, { type: 'tick', now: START_MS + BONUS_MS });
    expect(s.status).toBe('over');
    expect(s.score).toBe(4);
  });

  it('pausar guarda o tempo e continuar retoma de onde parou', () => {
    let s = reducer(started(), { type: 'pause', now: 4000 });
    expect(s.status).toBe('paused');
    expect(s.remaining).toBe(6000);
    s = reducer(s, { type: 'start', now: 100000 });
    expect(s.deadline).toBe(106000);
    expect(s.score).toBe(0);
  });

  it('jogar de novo zera a partida', () => {
    let s = reducer(started(), { type: 'type', value: 'casa', now: 0 });
    s = reducer(s, { type: 'tick', now: 999999 });
    s = reducer(s, { type: 'start', now: 0 });
    expect(s.score).toBe(0);
    expect(s.remaining).toBe(START_MS);
  });

  it('mostra quantas letras batem com o que foi digitado', () => {
    expect(matchInfo('janela', 'jan')).toEqual({ ok: 3, wrong: false });
    expect(matchInfo('janela', 'jax')).toEqual({ ok: 2, wrong: true });
    expect(matchInfo('janela', '')).toEqual({ ok: 0, wrong: false });
  });
});
