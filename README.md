# Typing Speed

Jogo de digitação em português contra o relógio. Você começa com 10 segundos; cada palavra certa vale uma letra por ponto e dá +3 segundos.

**Jogar:** https://marlonrodler.github.io/typing-speed/

## Como funciona

- As palavras vêm do [Dicionário Aberto](https://dicionario-aberto.net). Só entram palavras sem espaço e sem acento, para qualquer teclado digitar.
- Quatro palavras ficam na tela; digite qualquer uma delas. As letras certas acendem em verde e o erro aparece em vermelho.
- **Enter** começa ou continua, **Esc** pausa. O jogo pausa sozinho se você trocar de aba.
- O recorde fica salvo no seu navegador.
- Se o dicionário demorar mais de 1,5 segundo, as primeiras palavras vêm de uma lista local, para o jogo começar logo. Se ele não responder, o jogo segue com a lista reserva e avisa na tela.

## Tecnologias

React 18 e Vite. Testes com Vitest e Testing Library. Fonte JetBrains Mono, servida junto com o site.

## Rodar localmente

Precisa de Node.js 20.19 ou mais novo.

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes
npm run build    # gera a pasta dist
```

## Publicar

A cada push na `main`, o GitHub Actions roda os testes, gera o build e publica na branch `gh-pages` (GitHub Pages).

## Histórico

A primeira versão (2023) foi feita com Create React App como estudo de React. Em 2026 o projeto foi modernizado: migração para Vite, palavras buscadas em paralelo (antes eram 15 pedidos em sequência antes de liberar o jogo), relógio preciso com pausa, tela de resultado, recorde, atalhos de teclado, acessibilidade e testes.
