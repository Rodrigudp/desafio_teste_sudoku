/**
 * Sudoku binário 6x6 (Takuzu / Binairo)
 * Disciplina: Projeto, Implementação e Teste de Software (2026)
 * Colaborador: Rodrigo A. Del Padre Filho
 *
 * Regras adotadas (variante clássica, tabuleiro fixo 6x6):
 *  - RN-01: o tabuleiro tem exatamente 6 linhas e 6 colunas.
 *  - RN-02: cada célula é vazia (null), 0 ou 1.
 *  - RN-03: não pode haver mais de dois valores iguais adjacentes
 *           na horizontal ou na vertical (não se aplica à diagonal).
 *  - RN-04: cada linha e cada coluna completa deve ter a mesma
 *           quantidade de 0 e 1 (três de cada). Em tabuleiro parcial,
 *           nenhuma linha ou coluna pode ultrapassar três 0 ou três 1.
 *  - RN-05: todas as linhas completas devem ser únicas.
 *  - RN-06: todas as colunas completas devem ser únicas.
 *  - RN-07: a jogada só ocorre em posição interna ao tabuleiro,
 *           sobre célula vazia, com valor 0 ou 1, e não pode violar as regras.
 *  - RN-08: células fornecidas como pistas (fixas) não podem ser
 *           alteradas nem apagadas.
 *  - RN-09: uma solução é um tabuleiro completamente preenchido
 *           que satisfaz RN-03, RN-04, RN-05 e RN-06.
 */

const TAMANHO = 6;
const META_POR_VALOR = TAMANHO / 2;
const VAZIO = null;

class ErroSudoku extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = "ErroSudoku";
    this.codigo = codigo;
  }
}

function ehVazio(valor) {
  return valor === VAZIO;
}

function ehBit(valor) {
  return valor === 0 || valor === 1;
}

function copiarMatriz(matriz) {
  return matriz.map((linha) => linha.slice());
}

function chaveSequencia(sequencia) {
  return sequencia.join("");
}

function assertPosicao(linha, coluna) {
  const linhaInteira = Number.isInteger(linha);
  const colunaInteira = Number.isInteger(coluna);
  if (
    !linhaInteira ||
    !colunaInteira ||
    linha < 0 ||
    linha >= TAMANHO ||
    coluna < 0 ||
    coluna >= TAMANHO
  ) {
    throw new ErroSudoku(
      "POSICAO_INVALIDA",
      `Posição inválida: linha ${linha}, coluna ${coluna}. Use índices de 0 a ${TAMANHO - 1}.`
    );
  }
}

function assertValorJogada(valor) {
  if (!ehBit(valor)) {
    throw new ErroSudoku(
      "VALOR_INVALIDO",
      `Valor inválido para jogada: ${String(valor)}. Use apenas 0 ou 1.`
    );
  }
}

function validarMatrizDeEntrada(pistas) {
  if (!Array.isArray(pistas) || pistas.length !== TAMANHO) {
    throw new ErroSudoku(
      "DIMENSAO_INVALIDA",
      `O tabuleiro deve ter exatamente ${TAMANHO} linhas.`
    );
  }

  const celulas = [];
  for (let i = 0; i < TAMANHO; i += 1) {
    const linha = pistas[i];
    if (!Array.isArray(linha) || linha.length !== TAMANHO) {
      throw new ErroSudoku(
        "DIMENSAO_INVALIDA",
        `A linha ${i} deve ter exatamente ${TAMANHO} colunas.`
      );
    }
    const copiada = [];
    for (let j = 0; j < TAMANHO; j += 1) {
      const valor = linha[j];
      if (!ehVazio(valor) && !ehBit(valor)) {
        throw new ErroSudoku(
          "VALOR_INVALIDO",
          `Valor inválido na posição (${i}, ${j}): ${String(valor)}. Use null, 0 ou 1.`
        );
      }
      copiada.push(ehVazio(valor) ? VAZIO : valor);
    }
    celulas.push(copiada);
  }
  return celulas;
}

function contarValores(sequencia) {
  let zeros = 0;
  let uns = 0;
  let preenchidas = 0;
  for (const valor of sequencia) {
    if (valor === 0) {
      zeros += 1;
      preenchidas += 1;
    } else if (valor === 1) {
      uns += 1;
      preenchidas += 1;
    }
  }
  return {
    zeros,
    uns,
    preenchidas,
    completa: preenchidas === TAMANHO,
  };
}

function temTresAdjacentes(sequencia) {
  for (let i = 0; i <= TAMANHO - 3; i += 1) {
    const a = sequencia[i];
    const b = sequencia[i + 1];
    const c = sequencia[i + 2];
    if (ehBit(a) && a === b && b === c) {
      return { violou: true, inicio: i, valor: a };
    }
  }
  return { violou: false };
}

function obterColuna(celulas, coluna) {
  const valores = [];
  for (let i = 0; i < TAMANHO; i += 1) {
    valores.push(celulas[i][coluna]);
  }
  return valores;
}

/**
 * Valida um tabuleiro parcial ou completo contra as regras RN-03 a RN-06.
 * Não exige que o tabuleiro esteja preenchido.
 */
function validarTabuleiro(celulas) {
  if (!Array.isArray(celulas) || celulas.length !== TAMANHO) {
    return {
      valido: false,
      codigo: "DIMENSAO_INVALIDA",
      mensagem: `O tabuleiro deve ter exatamente ${TAMANHO} linhas.`,
    };
  }

  for (let i = 0; i < TAMANHO; i += 1) {
    if (!Array.isArray(celulas[i]) || celulas[i].length !== TAMANHO) {
      return {
        valido: false,
        codigo: "DIMENSAO_INVALIDA",
        mensagem: `A linha ${i} deve ter exatamente ${TAMANHO} colunas.`,
      };
    }
    for (let j = 0; j < TAMANHO; j += 1) {
      const valor = celulas[i][j];
      if (!ehVazio(valor) && !ehBit(valor)) {
        return {
          valido: false,
          codigo: "VALOR_INVALIDO",
          mensagem: `Valor inválido na posição (${i}, ${j}): ${String(valor)}.`,
        };
      }
    }
  }

  for (let i = 0; i < TAMANHO; i += 1) {
    const adjacencia = temTresAdjacentes(celulas[i]);
    if (adjacencia.violou) {
      return {
        valido: false,
        codigo: "TRES_ADJACENTES",
        mensagem: `A linha ${i} possui três ${adjacencia.valor} adjacentes a partir da coluna ${adjacencia.inicio}.`,
      };
    }
    const contagem = contarValores(celulas[i]);
    if (contagem.zeros > META_POR_VALOR || contagem.uns > META_POR_VALOR) {
      return {
        valido: false,
        codigo: "QUANTIDADE_EXCEDIDA",
        mensagem: `A linha ${i} excede ${META_POR_VALOR} ocorrências do mesmo valor (0=${contagem.zeros}, 1=${contagem.uns}).`,
      };
    }
  }

  for (let j = 0; j < TAMANHO; j += 1) {
    const coluna = obterColuna(celulas, j);
    const adjacencia = temTresAdjacentes(coluna);
    if (adjacencia.violou) {
      return {
        valido: false,
        codigo: "TRES_ADJACENTES",
        mensagem: `A coluna ${j} possui três ${adjacencia.valor} adjacentes a partir da linha ${adjacencia.inicio}.`,
      };
    }
    const contagem = contarValores(coluna);
    if (contagem.zeros > META_POR_VALOR || contagem.uns > META_POR_VALOR) {
      return {
        valido: false,
        codigo: "QUANTIDADE_EXCEDIDA",
        mensagem: `A coluna ${j} excede ${META_POR_VALOR} ocorrências do mesmo valor (0=${contagem.zeros}, 1=${contagem.uns}).`,
      };
    }
  }

  const linhasCompletas = new Map();
  for (let i = 0; i < TAMANHO; i += 1) {
    const contagem = contarValores(celulas[i]);
    if (!contagem.completa) {
      continue;
    }
    const chave = chaveSequencia(celulas[i]);
    if (linhasCompletas.has(chave)) {
      return {
        valido: false,
        codigo: "LINHA_DUPLICADA",
        mensagem: `A linha ${i} repete o padrão da linha ${linhasCompletas.get(chave)}.`,
      };
    }
    linhasCompletas.set(chave, i);
  }

  const colunasCompletas = new Map();
  for (let j = 0; j < TAMANHO; j += 1) {
    const coluna = obterColuna(celulas, j);
    const contagem = contarValores(coluna);
    if (!contagem.completa) {
      continue;
    }
    const chave = chaveSequencia(coluna);
    if (colunasCompletas.has(chave)) {
      return {
        valido: false,
        codigo: "COLUNA_DUPLICADA",
        mensagem: `A coluna ${j} repete o padrão da coluna ${colunasCompletas.get(chave)}.`,
      };
    }
    colunasCompletas.set(chave, j);
  }

  return { valido: true, codigo: "OK", mensagem: "Tabuleiro válido." };
}

function assertValidacao(validacao) {
  if (!validacao.valido) {
    throw new ErroSudoku(validacao.codigo, validacao.mensagem);
  }
}

function criarJogo(pistas = null) {
  if (pistas !== null && pistas !== undefined) {
    const celulas = validarMatrizDeEntrada(pistas);
    assertValidacao(validarTabuleiro(celulas));
    const fixas = celulas.map((linha) => linha.map((valor) => !ehVazio(valor)));
    return { celulas, fixas };
  }

  const celulas = Array.from({ length: TAMANHO }, () =>
    Array(TAMANHO).fill(VAZIO)
  );
  const fixas = Array.from({ length: TAMANHO }, () =>
    Array(TAMANHO).fill(false)
  );
  return { celulas, fixas };
}

function obterTabuleiro(jogo) {
  return copiarMatriz(jogo.celulas);
}

function estaCompleto(jogo) {
  for (let i = 0; i < TAMANHO; i += 1) {
    for (let j = 0; j < TAMANHO; j += 1) {
      if (ehVazio(jogo.celulas[i][j])) {
        return false;
      }
    }
  }
  return true;
}

function jogar(jogo, linha, coluna, valor) {
  assertPosicao(linha, coluna);
  assertValorJogada(valor);

  if (jogo.fixas[linha][coluna]) {
    throw new ErroSudoku(
      "CELULA_FIXA",
      `A célula (${linha}, ${coluna}) é uma pista e não pode ser alterada.`
    );
  }

  if (!ehVazio(jogo.celulas[linha][coluna])) {
    throw new ErroSudoku(
      "CELULA_OCUPADA",
      `A célula (${linha}, ${coluna}) já está preenchida. Limpe-a antes de jogar novamente.`
    );
  }

  const celulas = copiarMatriz(jogo.celulas);
  celulas[linha][coluna] = valor;
  assertValidacao(validarTabuleiro(celulas));

  return {
    celulas,
    fixas: copiarMatriz(jogo.fixas),
  };
}

function limparCelula(jogo, linha, coluna) {
  assertPosicao(linha, coluna);

  if (jogo.fixas[linha][coluna]) {
    throw new ErroSudoku(
      "CELULA_FIXA",
      `A célula (${linha}, ${coluna}) é uma pista e não pode ser apagada.`
    );
  }

  const celulas = copiarMatriz(jogo.celulas);
  celulas[linha][coluna] = VAZIO;
  return {
    celulas,
    fixas: copiarMatriz(jogo.fixas),
  };
}

function podeJogar(jogo, linha, coluna, valor) {
  try {
    jogar(jogo, linha, coluna, valor);
    return true;
  } catch (erro) {
    if (erro instanceof ErroSudoku) {
      return false;
    }
    throw erro;
  }
}

function verificarSolucao(jogoOuCelulas) {
  const celulas = Array.isArray(jogoOuCelulas)
    ? jogoOuCelulas
    : jogoOuCelulas.celulas;

  if (!Array.isArray(celulas) || celulas.length !== TAMANHO) {
    return false;
  }

  for (let i = 0; i < TAMANHO; i += 1) {
    if (!Array.isArray(celulas[i]) || celulas[i].length !== TAMANHO) {
      return false;
    }
    for (let j = 0; j < TAMANHO; j += 1) {
      if (!ehBit(celulas[i][j])) {
        return false;
      }
    }
  }

  return validarTabuleiro(celulas).valido;
}

function tabuleiroParaTexto(jogoOuCelulas) {
  const celulas = Array.isArray(jogoOuCelulas)
    ? jogoOuCelulas
    : jogoOuCelulas.celulas;
  return celulas
    .map((linha) =>
      linha.map((valor) => (ehVazio(valor) ? "." : String(valor))).join(" ")
    )
    .join("\n");
}

module.exports = {
  TAMANHO,
  META_POR_VALOR,
  VAZIO,
  ErroSudoku,
  criarJogo,
  obterTabuleiro,
  jogar,
  limparCelula,
  podeJogar,
  validarTabuleiro,
  verificarSolucao,
  estaCompleto,
  tabuleiroParaTexto,
};
