const {
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
} = require("../src/sudokuBinario");

/**
 * Solução 6x6 conhecida e válida:
 *  0 0 1 0 1 1
 *  1 0 0 1 0 1
 *  0 1 0 1 1 0
 *  1 0 1 0 0 1
 *  0 1 1 0 1 0
 *  1 1 0 1 0 0
 */
const SOLUCAO_VALIDA = [
  [0, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 0, 1],
  [0, 1, 1, 0, 1, 0],
  [1, 1, 0, 1, 0, 0],
];

function copiar(matriz) {
  return matriz.map((linha) => linha.slice());
}

function comCelula(matriz, linha, coluna, valor) {
  const copia = copiar(matriz);
  copia[linha][coluna] = valor;
  return copia;
}

function expectFormatoValidacao(resultado, valido, codigo) {
  expect(Object.keys(resultado).sort()).toEqual(["codigo", "mensagem", "valido"]);
  expect(resultado).toEqual(
    expect.objectContaining({
      valido,
      codigo,
      mensagem: expect.any(String),
    })
  );
  expect(resultado.mensagem.length).toBeGreaterThan(0);
}

describe("RN-01 e RN-02 — criação do tabuleiro", () => {
  test("CT-01: constantes do jogo e tabuleiro vazio 6x6", () => {
    expect(TAMANHO).toBe(6);
    expect(META_POR_VALOR).toBe(3);
    expect(VAZIO).toBeNull();

    const jogo = criarJogo();
    const tabuleiro = obterTabuleiro(jogo);

    expect(tabuleiro).toHaveLength(6);
    tabuleiro.forEach((linha) => {
      expect(linha).toHaveLength(6);
      expect(linha.every((celula) => celula === VAZIO)).toBe(true);
    });
    expect(estaCompleto(jogo)).toBe(false);
  });

  test("CT-03: criarJogo aceita pistas válidas e preserva os valores", () => {
    const pistas = [
      [0, 0, VAZIO, 0, 1, 1],
      [1, VAZIO, 0, 1, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, VAZIO, 0, 1],
      [0, 1, 1, 0, 1, 0],
      [1, 1, 0, 1, 0, VAZIO],
    ];

    const jogo = criarJogo(pistas);
    const tabuleiro = obterTabuleiro(jogo);

    expect(tabuleiro[0][0]).toBe(0);
    expect(tabuleiro[0][2]).toBe(VAZIO);
    expect(tabuleiro[1][1]).toBe(VAZIO);
    expect(tabuleiro[5][5]).toBe(VAZIO);
    expect(tabuleiro[2][5]).toBe(0);
  });

  test("CT-04: criarJogo rejeita tabuleiro com número de linhas diferente de 6", () => {
    expect(() => criarJogo([[0, 1, 0, 1, 0, 1]])).toThrow(ErroSudoku);
    expect(() => criarJogo([[0, 1, 0, 1, 0, 1]])).toThrow(
      expect.objectContaining({ codigo: "DIMENSAO_INVALIDA" })
    );
  });

  test("CT-05: criarJogo rejeita linha com número de colunas diferente de 6", () => {
    const irregular = [
      [0, 1, 0, 1, 0],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(irregular)).toThrow(
      expect.objectContaining({ codigo: "DIMENSAO_INVALIDA" })
    );
  });

  test("CT-06: criarJogo rejeita valores diferentes de null, 0 ou 1", () => {
    const invalido = [
      [0, 1, 2, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(invalido)).toThrow(
      expect.objectContaining({ codigo: "VALOR_INVALIDO" })
    );
  });

  test("CT-07: criarJogo rejeita string no lugar de bit (ex.: '0')", () => {
    const comString = [
      ["0", 1, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(comString)).toThrow(
      expect.objectContaining({ codigo: "VALOR_INVALIDO" })
    );
  });

  test("CT-08: criarJogo não altera a matriz de pistas e não compartilha a referência", () => {
    const pistas = [
      [0, VAZIO, VAZIO, VAZIO, VAZIO, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, 0],
    ];
    const original = copiar(pistas);

    const jogo = criarJogo(pistas);

    expect(pistas).toEqual(original);

    pistas[0][0] = 1;
    pistas[0][1] = 1;

    expect(obterTabuleiro(jogo)[0][0]).toBe(0);
    expect(obterTabuleiro(jogo)[0][1]).toBe(VAZIO);
  });

  test("CT-09: obterTabuleiro devolve cópia, isolando o estado interno", () => {
    const jogo = criarJogo();
    const visto = obterTabuleiro(jogo);
    visto[0][0] = 1;

    expect(obterTabuleiro(jogo)[0][0]).toBe(VAZIO);
  });
});

describe("RN-03 — no máximo dois iguais adjacentes", () => {
  test("CT-10: criarJogo rejeita três 0 adjacentes na horizontal (início da linha)", () => {
    const pistas = [
      [0, 0, 0, 1, 1, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(pistas)).toThrow(
      expect.objectContaining({ codigo: "TRES_ADJACENTES" })
    );
  });

  test("CT-11: jogar rejeita o terceiro 1 consecutivo no meio da linha", () => {
    const jogo = criarJogo([
      [0, VAZIO, 1, 1, VAZIO, 0],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 0, 4, 1)).toThrow(
      expect.objectContaining({ codigo: "TRES_ADJACENTES" })
    );
  });

  test("CT-12: jogar rejeita três 0 adjacentes na vertical", () => {
    const jogo = criarJogo([
      [0, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [0, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 2, 0, 0)).toThrow(
      expect.objectContaining({ codigo: "TRES_ADJACENTES" })
    );
  });

  test("CT-13: jogar rejeita três 1 adjacentes no final da coluna (linhas 3-4-5)", () => {
    const jogo = criarJogo([
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 5, 5, 1)).toThrow(
      expect.objectContaining({ codigo: "TRES_ADJACENTES" })
    );
  });

  test("CT-14: aceita exatamente dois valores iguais adjacentes (limite permitido)", () => {
    const jogo = criarJogo();
    const depoisDoPrimeiro = jogar(jogo, 0, 0, 0);
    const depoisDoSegundo = jogar(depoisDoPrimeiro, 0, 1, 0);

    expect(obterTabuleiro(depoisDoSegundo)[0][0]).toBe(0);
    expect(obterTabuleiro(depoisDoSegundo)[0][1]).toBe(0);
    expect(validarTabuleiro(obterTabuleiro(depoisDoSegundo)).valido).toBe(true);
  });

  test("CT-15: três iguais na diagonal NÃO violam a regra (diagonal não é restringida)", () => {
    const comDiagonal = [
      [0, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, 0, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(comDiagonal)).not.toThrow();
    expect(validarTabuleiro(comDiagonal).valido).toBe(true);
  });
});

describe("RN-04 — mesma quantidade de 0 e 1 por linha e coluna", () => {
  test("CT-16: jogar rejeita o quarto 0 na mesma linha, mesmo não consecutivo", () => {
    const jogo = criarJogo([
      [0, VAZIO, 0, VAZIO, 0, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 0, 5, 0)).toThrow(
      expect.objectContaining({ codigo: "QUANTIDADE_EXCEDIDA" })
    );
  });

  test("CT-17: jogar rejeita o quarto 1 na mesma coluna", () => {
    const jogo = criarJogo([
      [1, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 5, 0, 1)).toThrow(
      expect.objectContaining({ codigo: "QUANTIDADE_EXCEDIDA" })
    );
  });

  test("CT-18: aceita o terceiro 0 que completa a cota da linha", () => {
    const jogo = criarJogo([
      [0, 0, 1, VAZIO, 1, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    const atualizado = jogar(jogo, 0, 3, 0);
    expect(obterTabuleiro(atualizado)[0]).toEqual([0, 0, 1, 0, 1, 1]);
  });

  test("CT-19: linha incompleta com no máximo três 0 e três 1 permanece válida", () => {
    const parcial = [
      [0, 0, 1, VAZIO, 1, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(validarTabuleiro(parcial).valido).toBe(true);
    expect(verificarSolucao(parcial)).toBe(false);
  });
});

describe("RN-05 e RN-06 — linhas e colunas únicas", () => {
  test("CT-20: jogar rejeita completar uma linha com padrão já existente em outra linha completa", () => {
    const jogo = criarJogo([
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 0, 1, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 1, 5, 1)).toThrow(
      expect.objectContaining({ codigo: "LINHA_DUPLICADA" })
    );
  });

  test("CT-21: jogar rejeita completar uma coluna com padrão já existente em outra coluna completa", () => {
    const jogo = criarJogo([
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, 1, VAZIO, VAZIO, VAZIO, VAZIO],
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, 1, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(() => jogar(jogo, 5, 1, 1)).toThrow(
      expect.objectContaining({ codigo: "COLUNA_DUPLICADA" })
    );
  });

  test("CT-22: duas linhas iguais incompletas ainda não caracterizam duplicidade", () => {
    const parcial = [
      [0, 0, 1, VAZIO, VAZIO, VAZIO],
      [0, 0, 1, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(validarTabuleiro(parcial).valido).toBe(true);
  });

  test("CT-23: criarJogo rejeita pistas com duas colunas completas iguais (linhas ainda incompletas)", () => {
    const colunasDuplicadas = [
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, 1, VAZIO, VAZIO, VAZIO, VAZIO],
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, 1, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, 1, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expect(() => criarJogo(colunasDuplicadas)).toThrow(
      expect.objectContaining({ codigo: "COLUNA_DUPLICADA" })
    );
  });
});

describe("RN-07 e RN-08 — jogada, pistas e remoção", () => {
  test("CT-24: jogar 0 e 1 em células vazias retorna novo estado com a jogada aplicada", () => {
    const jogo = criarJogo();
    const comZero = jogar(jogo, 2, 3, 0);
    const comUm = jogar(comZero, 4, 1, 1);
    const tabuleiro = obterTabuleiro(comUm);

    expect(tabuleiro[2][3]).toBe(0);
    expect(tabuleiro[4][1]).toBe(1);
    expect(obterTabuleiro(jogo)[2][3]).toBe(VAZIO);
  });

  test("CT-25: rejeita jogada fora do tabuleiro (limites -1 e 6)", () => {
    const jogo = criarJogo();

    expect(() => jogar(jogo, -1, 0, 1)).toThrow(
      expect.objectContaining({ codigo: "POSICAO_INVALIDA" })
    );
    expect(() => jogar(jogo, 0, -1, 1)).toThrow(
      expect.objectContaining({ codigo: "POSICAO_INVALIDA" })
    );
    expect(() => jogar(jogo, 6, 0, 1)).toThrow(
      expect.objectContaining({ codigo: "POSICAO_INVALIDA" })
    );
    expect(() => jogar(jogo, 0, 6, 0)).toThrow(
      expect.objectContaining({ codigo: "POSICAO_INVALIDA" })
    );
  });

  test("CT-26: rejeita jogada com valor diferente de 0 ou 1", () => {
    const jogo = criarJogo();

    expect(() => jogar(jogo, 0, 0, 2)).toThrow(
      expect.objectContaining({ codigo: "VALOR_INVALIDO" })
    );
    expect(() => jogar(jogo, 0, 0, -1)).toThrow(
      expect.objectContaining({ codigo: "VALOR_INVALIDO" })
    );
    expect(() => jogar(jogo, 0, 0, null)).toThrow(
      expect.objectContaining({ codigo: "VALOR_INVALIDO" })
    );
  });

  test("CT-27: rejeita jogada sobre pista fixa", () => {
    const jogo = criarJogo([
      [0, VAZIO, VAZIO, VAZIO, VAZIO, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, 0],
    ]);

    expect(() => jogar(jogo, 0, 0, 1)).toThrow(
      expect.objectContaining({ codigo: "CELULA_FIXA" })
    );
  });

  test("CT-28: rejeita sobrescrever célula já preenchida pelo jogador", () => {
    const jogo = jogar(criarJogo(), 3, 3, 1);

    expect(() => jogar(jogo, 3, 3, 0)).toThrow(
      expect.objectContaining({ codigo: "CELULA_OCUPADA" })
    );
  });

  test("CT-29: limparCelula remove jogada do aluno, mas não remove pista", () => {
    const pistas = [
      [0, VAZIO, VAZIO, VAZIO, VAZIO, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [1, VAZIO, VAZIO, VAZIO, VAZIO, 0],
    ];
    const comJogada = jogar(criarJogo(pistas), 1, 1, 1);
    const limpo = limparCelula(comJogada, 1, 1);

    expect(obterTabuleiro(limpo)[1][1]).toBe(VAZIO);
    expect(() => limparCelula(limpo, 0, 0)).toThrow(
      expect.objectContaining({ codigo: "CELULA_FIXA" })
    );
  });

  test("CT-30: podeJogar retorna true apenas quando a jogada é legal", () => {
    const jogo = criarJogo([
      [0, 0, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ]);

    expect(podeJogar(jogo, 0, 2, 1)).toBe(true);
    expect(podeJogar(jogo, 0, 2, 0)).toBe(false);
    expect(podeJogar(jogo, 0, 0, 1)).toBe(false);
    expect(podeJogar(jogo, 9, 9, 1)).toBe(false);
  });

  test("CT-31: podeJogar não altera o tabuleiro original", () => {
    const jogo = criarJogo();
    podeJogar(jogo, 0, 0, 1);

    expect(obterTabuleiro(jogo)[0][0]).toBe(VAZIO);
  });
});

describe("RN-09 — verificação de solução", () => {
  test("CT-32: solução válida conhecida é aceita e o tabuleiro está completo", () => {
    const jogo = criarJogo(SOLUCAO_VALIDA);

    expect(estaCompleto(jogo)).toBe(true);
    expect(validarTabuleiro(SOLUCAO_VALIDA).valido).toBe(true);
    expect(verificarSolucao(jogo)).toBe(true);
    expect(verificarSolucao(SOLUCAO_VALIDA)).toBe(true);
  });

  test("CT-33: tabuleiro vazio não é solução", () => {
    expect(verificarSolucao(criarJogo())).toBe(false);
  });

  test("CT-34: tabuleiro com uma única célula vazia não é solução", () => {
    const incompleto = comCelula(SOLUCAO_VALIDA, 5, 5, VAZIO);

    expect(verificarSolucao(incompleto)).toBe(false);
    expect(validarTabuleiro(incompleto).valido).toBe(true);
  });

  test("CT-35: tabuleiro completo com três adjacentes não é solução", () => {
    const invalido = [
      [0, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 1, 0, 0, 1],
      [1, 0, 1, 1, 0, 0],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
    ];

    expect(verificarSolucao(invalido)).toBe(false);
    expect(validarTabuleiro(invalido).codigo).toBe("TRES_ADJACENTES");
  });

  test("CT-36: tabuleiro completo com quatro 1 em uma linha não é solução", () => {
    const quatroUns = comCelula(SOLUCAO_VALIDA, 0, 3, 1);

    expect(quatroUns[0]).toEqual([0, 0, 1, 1, 1, 1]);
    expect(verificarSolucao(quatroUns)).toBe(false);
    expect(validarTabuleiro(quatroUns).codigo).toBe("TRES_ADJACENTES");
  });

  test("CT-37: tabuleiro completo com 4 uns e 2 zeros, sem três adjacentes, não é solução", () => {
    const desigual = [
      [1, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
    ];

    expect(desigual[0]).toEqual([1, 1, 0, 1, 1, 0]);
    expect(verificarSolucao(desigual)).toBe(false);
    expect(validarTabuleiro(desigual).codigo).toBe("QUANTIDADE_EXCEDIDA");
  });

  test("CT-38: tabuleiro completo com linhas duplicadas não é solução", () => {
    const linhasIguais = [
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 1, 0, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 0],
    ];

    expect(verificarSolucao(linhasIguais)).toBe(false);
    expect(validarTabuleiro(linhasIguais).codigo).toBe("LINHA_DUPLICADA");
  });

  test("CT-39: tabuleiro completo com colunas duplicadas (linhas únicas e demais regras ok) não é solução", () => {
    const colunasIguais = [
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 1, 0, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 0],
    ];

    expect(verificarSolucao(colunasIguais)).toBe(false);
    expect(validarTabuleiro(colunasIguais).codigo).toBe("COLUNA_DUPLICADA");
  });

  test("CT-40: verificarSolucao rejeita matriz com dimensão incorreta ou valor inválido", () => {
    expect(verificarSolucao([])).toBe(false);
    expect(verificarSolucao(comCelula(SOLUCAO_VALIDA, 0, 0, 2))).toBe(false);
  });
});

describe("Partida — sequência de jogadas até a solução", () => {
  test("CT-41: preencher as lacunas de um puzzle válido conduz à solução", () => {
    const pistas = comCelula(
      comCelula(comCelula(SOLUCAO_VALIDA, 0, 2, VAZIO), 1, 1, VAZIO),
      5,
      5,
      VAZIO
    );
    let jogo = criarJogo(pistas);

    expect(estaCompleto(jogo)).toBe(false);
    expect(verificarSolucao(jogo)).toBe(false);

    jogo = jogar(jogo, 0, 2, 1);
    jogo = jogar(jogo, 1, 1, 0);
    jogo = jogar(jogo, 5, 5, 0);

    expect(estaCompleto(jogo)).toBe(true);
    expect(verificarSolucao(jogo)).toBe(true);
    expect(obterTabuleiro(jogo)).toEqual(SOLUCAO_VALIDA);
  });

  test("CT-42: uma jogada ilegal no puzzle não altera o estado anterior", () => {
    const pistas = comCelula(SOLUCAO_VALIDA, 0, 2, VAZIO);
    const jogo = criarJogo(pistas);
    const antes = obterTabuleiro(jogo);

    expect(() => jogar(jogo, 0, 2, 0)).toThrow(ErroSudoku);
    expect(obterTabuleiro(jogo)).toEqual(antes);
  });
});

describe("Contrato de validarTabuleiro", () => {
  test("CT-43: tabuleiro válido retorna exatamente {valido, codigo, mensagem} com codigo OK", () => {
    const parcial = [
      [0, 0, VAZIO, 0, 1, 1],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];
    const succesoParcial = validarTabuleiro(parcial);
    const succesoCompleto = validarTabuleiro(SOLUCAO_VALIDA);

    expectFormatoValidacao(succesoParcial, true, "OK");
    expectFormatoValidacao(succesoCompleto, true, "OK");
  });

  test("CT-44: matriz com número de linhas diferente de 6 retorna DIMENSAO_INVALIDA", () => {
    const resultadoVazio = validarTabuleiro([]);
    const resultadoCurto = validarTabuleiro([[0, 1, 0, 1, 0, 1]]);

    expectFormatoValidacao(resultadoVazio, false, "DIMENSAO_INVALIDA");
    expectFormatoValidacao(resultadoCurto, false, "DIMENSAO_INVALIDA");
  });

  test("CT-45: matriz 6x6 com uma linha de tamanho errado retorna DIMENSAO_INVALIDA", () => {
    const irregular = [
      [0, 1, 0, 1, 0],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expectFormatoValidacao(validarTabuleiro(irregular), false, "DIMENSAO_INVALIDA");
  });

  test("CT-46: valor inválido retorna VALOR_INVALIDO no formato padrão", () => {
    const invalido = comCelula(
      [
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
        [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      ],
      0,
      2,
      2
    );

    expectFormatoValidacao(validarTabuleiro(invalido), false, "VALOR_INVALIDO");
  });

  test("CT-47: três adjacentes retornam TRES_ADJACENTES no formato padrão", () => {
    const tres = [
      [0, 0, 0, 1, 1, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
      [VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO],
    ];

    expectFormatoValidacao(validarTabuleiro(tres), false, "TRES_ADJACENTES");
  });

  test("CT-48: quantidade excedida retorna QUANTIDADE_EXCEDIDA no formato padrão", () => {
    const excedida = [
      [1, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
    ];

    expectFormatoValidacao(validarTabuleiro(excedida), false, "QUANTIDADE_EXCEDIDA");
  });

  test("CT-49: linhas completas duplicadas retornam LINHA_DUPLICADA no formato padrão", () => {
    const linhasIguais = [
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 1, 0, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 0],
    ];

    expectFormatoValidacao(validarTabuleiro(linhasIguais), false, "LINHA_DUPLICADA");
  });

  test("CT-50: colunas completas duplicadas retornam COLUNA_DUPLICADA no formato padrão", () => {
    const colunasIguais = [
      [0, 0, 1, 0, 1, 1],
      [0, 0, 1, 1, 0, 1],
      [1, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 0],
    ];

    expectFormatoValidacao(validarTabuleiro(colunasIguais), false, "COLUNA_DUPLICADA");
  });
});

describe("tabuleiroParaTexto", () => {
  test("CT-51: tabuleiro vazio vira ponto; valores separados por espaço e linhas por quebra de linha", () => {
    const linhaVazia = ". . . . . .";
    const esperado = Array(TAMANHO).fill(linhaVazia).join("\n");
    const texto = tabuleiroParaTexto(obterTabuleiro(criarJogo()));

    expect(texto).toBe(esperado);
    expect(texto.split("\n")).toHaveLength(6);
    expect(texto.endsWith("\n")).toBe(false);
  });

  test("CT-52: 0 e 1 aparecem como dígitos e células vazias como ponto", () => {
    const pistas = [
      [0, 0, VAZIO, 0, 1, 1],
      [1, VAZIO, 0, 1, 0, 1],
      [0, 1, 0, 1, 1, 0],
      [1, 0, 1, VAZIO, 0, 1],
      [0, 1, 1, 0, 1, 0],
      [1, 1, 0, 1, 0, VAZIO],
    ];
    const esperado = [
      "0 0 . 0 1 1",
      "1 . 0 1 0 1",
      "0 1 0 1 1 0",
      "1 0 1 . 0 1",
      "0 1 1 0 1 0",
      "1 1 0 1 0 .",
    ].join("\n");

    expect(tabuleiroParaTexto(pistas)).toBe(esperado);
    expect(tabuleiroParaTexto(criarJogo(pistas))).toBe(esperado);
  });

  test("CT-53: solução completa é impressa só com 0 e 1, separados por espaço", () => {
    const esperado = [
      "0 0 1 0 1 1",
      "1 0 0 1 0 1",
      "0 1 0 1 1 0",
      "1 0 1 0 0 1",
      "0 1 1 0 1 0",
      "1 1 0 1 0 0",
    ].join("\n");

    expect(tabuleiroParaTexto(SOLUCAO_VALIDA)).toBe(esperado);
    expect(tabuleiroParaTexto(criarJogo(SOLUCAO_VALIDA))).toBe(esperado);
  });
});
