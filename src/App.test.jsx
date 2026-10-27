import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';

const WORDS = ['casa', 'janela', 'rio', 'barco', 'pedra', 'livro', 'mesa', 'gato', 'sapo', 'lua', 'sol', 'vento', 'nuvem', 'folha'];

beforeEach(() => {
  let i = 0;
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ word: WORDS[i++ % WORDS.length] }) })));
  localStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

it('carrega palavras, joga e marca pontos pelo teclado', async () => {
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(screen.getByRole('button', { name: /começar/i })).toBeEnabled());

  await user.keyboard('{Enter}');
  const input = screen.getByLabelText(/digite uma das palavras/i);
  await waitFor(() => expect(input).toHaveFocus());

  const first = screen.getAllByRole('listitem')[0].querySelector('.word__rest').textContent;
  await user.type(input, first);
  expect(screen.getByText(new RegExp(`${first}: \\+${first.length} pontos`))).toBeInTheDocument();
  expect(input).toHaveValue('');

  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
});

it('usa a lista reserva se o dicionário estiver fora do ar', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
  render(<App />);
  await waitFor(() => expect(screen.getByText(/lista reserva/i)).toBeInTheDocument());
  await act(async () => {});
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
});
