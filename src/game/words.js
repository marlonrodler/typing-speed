// Regras das palavras: as mesmas do projeto original.
// A palavra vem do Dicionário Aberto e só entra no jogo se não tiver espaço
// nem acento (para qualquer teclado digitar), e se ainda não estiver no jogo.

export const API_URL = 'https://api.dicionario-aberto.net/random';

/** Retorna a palavra em minúsculas se ela vale para o jogo, ou null. */
export function acceptWord(raw) {
  if (typeof raw !== 'string') return null;
  const word = raw.trim();
  if (!word || /\s/.test(word)) return null;
  // Sem acento: a forma sem diacríticos precisa ser igual à original
  if (word.normalize('NFD').replace(/\p{Diacritic}/gu, '') !== word) return null;
  // Só letras e hífen (o dicionário traz palavras como "carta-lege")
  if (!/^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(word)) return null;
  if (word.length < 3 || word.length > 14) return null;
  return word.toLowerCase();
}

/** Busca uma palavra aleatória. Lança erro se a API falhar ou demorar. */
export async function fetchRandomWord(signal) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.word;
}

// Reserva local: usada só se o Dicionário Aberto estiver fora do ar,
// para o jogo nunca ficar travado esperando.
export const FALLBACK_WORDS = `
abacate abelha abismo acordar adulto agulha alegria almofada alvorada amarelo
amizade andorinha anel aniversario antigo aquarela arame arvore assobio atalho
azulejo bailarina baleia bambu banheira barco bateria beijo biblioteca bicicleta
bigode biscoito bolacha bondade borboleta bosque brinquedo brisa bussola cabelo
cachoeira cadeira caderno caminho campainha canela caneta canoa capivara caracol
carinho carroça cascata castelo cavalo cebola cenoura cereja chaleira chapeu
chocolate chuveiro cidade cinema circo coelho colmeia cometa coragem corrida
cortina coruja cozinha cristal dedal deserto desenho diamante dinossauro domingo
dourado elefante empada enxada escada escola esmeralda espelho esquilo estrela
fagulha farol fazenda feijoada ferradura figueira floresta fogueira folha formiga
fronteira fumaça futebol galinha garrafa gaveta geladeira girafa girassol goiaba
gramado granizo guarda guitarra horizonte hortela ilha incenso inverno janela
jardim jabuticaba joaninha juventude labirinto lagarto lagoa lampada lanterna
laranja lareira leque limonada livro lousa lua macaco madeira manhã mapa maracuja
martelo melancia mergulho mochila moinho montanha morango mosaico musica navio
neblina ninho novelo oceano oficina onda orvalho ouriço ovelha paciencia palmeira
panela papagaio paraquedas passaro pedra peixe pena pepino pergunta peteca piano
pimenta pinguim pipoca planeta poeira pomar ponte primavera quadro queijo quintal
raposa relogio remo rio rodovia sabonete sapato saudade semente serra sereia
silencio sorriso tabuleiro tamborim tartaruga teclado telhado tempestade tesoura
tigela tijolo tomate tornado trem trovao tucano universo urso vaga-lume vela
veleiro ventania verao vidro violino vulcao xadrez xicara zebra
`
  .split(/\s+/)
  .map(acceptWord)
  .filter(Boolean);

/** Embaralha uma cópia da lista (Fisher-Yates). */
export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
