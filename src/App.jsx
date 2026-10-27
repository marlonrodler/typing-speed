import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { BONUS_MS, START_MS, VISIBLE, initialState, matchInfo, reducer, visibleWords } from './game/reducer';
import { useWordPool } from './game/useWordPool';
import { loadBest, saveBest } from './game/best';

const fmt = (ms) => (ms / 1000).toFixed(1);

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [best, setBest] = useState(loadBest);
  const [newBest, setNewBest] = useState(false);
  const inputRef = useRef(null);
  const startRef = useRef(null);

  const addWords = useCallback((words) => dispatch({ type: 'words/add', words }), []);
  const { source } = useWordPool(state.pool.length, addWords);

  const words = visibleWords(state);
  const ready = words.length >= VISIBLE;
  const { status } = state;

  // Relógio: calcula o tempo a partir do prazo, sem acumular atraso
  useEffect(() => {
    if (status !== 'running') return undefined;
    let raf;
    const loop = () => {
      dispatch({ type: 'tick', now: performance.now() });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  // Fim de jogo: recorde pessoal
  useEffect(() => {
    if (status !== 'over') return;
    if (state.score > best) {
      setBest(state.score);
      saveBest(state.score);
      setNewBest(true);
    } else setNewBest(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Foco no campo quando o jogo roda
  useEffect(() => {
    if (status === 'running') inputRef.current?.focus();
  }, [status]);

  const start = () => {
    if (!ready) return;
    dispatch({ type: 'start', now: performance.now() });
    // Foco no mesmo toque: no celular, só assim o teclado abre
    inputRef.current?.focus();
  };
  const pause = () => dispatch({ type: 'pause', now: performance.now() });
  const reset = () => {
    dispatch({ type: 'reset' });
    setNewBest(false);
    startRef.current?.focus();
  };

  // Atalhos: Enter começa/continua, Esc pausa
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && status === 'running') { e.preventDefault(); pause(); }
      else if (e.key === 'Enter' && status !== 'running' && !e.target.closest?.('button')) { e.preventDefault(); start(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Pausa sozinho se a pessoa troca de aba
  useEffect(() => {
    const onHide = () => document.hidden && dispatch({ type: 'pause', now: performance.now() });
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const pct = Math.min(1, state.remaining / START_MS);
  const low = status === 'running' && state.remaining < 3000;
  const primaryLabel =
    status === 'running' ? 'Pausar' : status === 'paused' ? 'Continuar' : status === 'over' ? 'Jogar de novo' : 'Começar';

  return (
    <div className={`app is-${status}`}>
      <header className="top">
        <h1 className="logo">
          Typing<span>Speed</span>
        </h1>
        <p className="best" aria-label={`Recorde: ${best} pontos`}>
          <span>Recorde</span>
          <strong>{best}</strong>
        </p>
      </header>

      <main className="stage">
        <section className="hud" aria-label="Placar">
          <div className={`timer${low ? ' is-low' : ''}`}>
            <span className="hud__label">Tempo</span>
            <span className="hud__value" aria-hidden="true">{fmt(state.remaining)}<small>s</small></span>
            <span className="sr-only">{Math.ceil(state.remaining / 1000)} segundos</span>
            <span className="timer__bar" aria-hidden="true"><i style={{ transform: `scaleX(${pct})` }} /></span>
          </div>
          <div className="stat">
            <span className="hud__label">Pontos</span>
            <span className="hud__value">{state.score}</span>
          </div>
          <div className="stat">
            <span className="hud__label">Palavras</span>
            <span className="hud__value">{state.hits}</span>
          </div>
        </section>

        <section className="board" aria-labelledby="board-title">
          <h2 id="board-title" className="sr-only">Palavras para digitar</h2>
          {ready ? (
            <ul className="words">
              {words.map((w) => {
                const m = status === 'running' ? matchInfo(w, state.input) : { ok: 0, wrong: false };
                const active = m.ok > 0;
                return (
                  <li
                    key={w}
                    className={`word${w.length >= 10 ? ' is-long' : ''}${active ? ' is-active' : ''}${active && m.wrong ? ' is-wrong' : ''}`}
                    style={{ '--len': w.length }}
                  >
                    <span className="word__text">
                      <span className="word__ok">{w.slice(0, m.ok)}</span>
                      <span className="word__rest">{w.slice(m.ok)}</span>
                    </span>
                    <span className="word__pts" aria-label={`${w.length} pontos`}>+{w.length}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="loading" role="status">
              <span className="loading__dots" aria-hidden="true"><i /><i /><i /></span>
              Buscando palavras no dicionário…
            </p>
          )}

          <label className="sr-only" htmlFor="typing">Digite uma das palavras</label>
          <input
            id="typing"
            ref={inputRef}
            className="input"
            value={state.input}
            onChange={(e) => dispatch({ type: 'type', value: e.target.value, now: performance.now() })}
            onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
            aria-disabled={status !== 'running'}
            placeholder={status === 'running' ? 'Digite uma palavra' : 'Aperte Enter para começar'}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
          />

          <p className="feedback" aria-live="polite">
            {state.lastHit && status === 'running' && (
              <span key={state.lastHit.id} className="feedback__hit">
                {state.lastHit.word}: +{state.lastHit.points} pontos, +{BONUS_MS / 1000}s
              </span>
            )}
          </p>
        </section>

        <div className="controls">
          <button
            ref={startRef}
            type="button"
            className={`btn btn--primary${status === 'running' ? ' btn--pause' : ''}`}
            onClick={status === 'running' ? pause : start}
            disabled={!ready && status !== 'running'}
          >
            {primaryLabel}
            <kbd>{status === 'running' ? 'Esc' : 'Enter'}</kbd>
          </button>
          <button type="button" className="btn btn--ghost" onClick={reset} disabled={status === 'idle'}>
            Reiniciar
          </button>
        </div>

        <p className="rules">
          Você começa com {START_MS / 1000} segundos. Cada palavra certa vale uma letra por ponto e dá +{BONUS_MS / 1000}s.
          {source === 'fallback' && <span className="rules__note"> O dicionário on-line não respondeu; usando a lista reserva.</span>}
        </p>
      </main>

      {status === 'over' && (
        <div className="result" role="dialog" aria-modal="false" aria-labelledby="result-title">
          <div className="result__card">
            <p className="result__eyebrow">{newBest ? 'Novo recorde' : 'Fim de jogo'}</p>
            <h2 id="result-title" className="result__score">
              {state.score} <span>pontos</span>
            </h2>
            <dl className="result__stats">
              <div><dt>Palavras</dt><dd>{state.hits}</dd></div>
              <div><dt>Maior palavra</dt><dd>{state.longest || '—'}</dd></div>
              <div><dt>Recorde</dt><dd>{best}</dd></div>
            </dl>
            <button type="button" className="btn btn--primary" onClick={start} autoFocus>
              Jogar de novo <kbd>Enter</kbd>
            </button>
          </div>
        </div>
      )}

      <footer className="foot">
        Palavras do <a href="https://dicionario-aberto.net" target="_blank" rel="noopener noreferrer">Dicionário Aberto</a>.
        Feito por <a href="https://marlonrodler.github.io" target="_blank" rel="noopener noreferrer">Marlon Rodler</a>.
      </footer>
    </div>
  );
}
