import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_WORDS, acceptWord, fetchRandomWord, shuffle } from './words';

const TARGET = 12; // palavras guardadas à frente
const PARALLEL = 6; // pedidos ao mesmo tempo (o original fazia um por vez)
const TIMEOUT_MS = 4000;
const MAX_TRIES = 40; // evita insistir para sempre se a API devolver só palavras inválidas

/**
 * Mantém um estoque de palavras do Dicionário Aberto.
 * Se a API falhar ou demorar, completa com a lista local para o jogo não travar.
 * `onWords` recebe as palavras novas; `count` é quantas o jogo tem agora.
 */
export function useWordPool(count, onWords) {
  const [source, setSource] = useState('api'); // api | fallback
  const busy = useRef(false);
  const failures = useRef(0);
  const onWordsRef = useRef(onWords);
  onWordsRef.current = onWords;

  const fill = useCallback(async (have) => {
    if (busy.current || have >= TARGET) return;
    busy.current = true;
    failures.current = 0; // tenta a API de novo a cada reposição
    const need = TARGET - have;
    const found = new Set();
    let tries = 0;

    const one = async () => {
      while (found.size < need && tries < MAX_TRIES && failures.current < 3) {
        tries++;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
          const word = acceptWord(await fetchRandomWord(ctrl.signal));
          failures.current = 0;
          if (word && !found.has(word)) {
            found.add(word);
            onWordsRef.current([word]); // entrega assim que chega
          }
        } catch {
          failures.current++;
        } finally {
          clearTimeout(timer);
        }
      }
    };

    await Promise.all(Array.from({ length: PARALLEL }, one));

    if (found.size < need) {
      // A API não deu conta: usa a reserva local
      setSource('fallback');
      onWordsRef.current(shuffle(FALLBACK_WORDS).slice(0, need - found.size + 4));
    }
    busy.current = false;
  }, []);

  useEffect(() => {
    if (count < TARGET / 2) fill(count);
  }, [count, fill]);

  // Primeira carga
  useEffect(() => {
    fill(0);
  }, [fill]);

  return { source, target: TARGET };
}
