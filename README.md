# Desafio: Sudoku binário 6x6

Repositório `desafio_teste_sudoku` da disciplina **Projeto, Implementação e Teste de Software (2026)**.

Entrega prevista até **22/11/2026**. Casos de teste em JavaScript para testar uma implementação também em JavaScript, conforme o enunciado em [desafios.md](https://github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md).

---

## Especificação do desafio

O enunciado pede casos de teste para um **Sudoku binário de tamanho 6 × 6**. Como o texto oficial não detalha as regras, este trabalho adota a variante clássica do **Takuzu / Binairo** nesse tamanho.

### Tabuleiro e valores

- O tabuleiro tem exatamente **6 linhas e 6 colunas**.
- Cada célula é **vazia** (`null`), **0** ou **1**. Strings como `"0"` ou `"1"` não são aceitas.
- Uma partida pode começar vazia ou com **pistas** (células já preenchidas e fixas).

### Regras do jogo

| ID | Regra |
|---|---|
| RN-01 | O tabuleiro é sempre 6 × 6. |
| RN-02 | Células aceitam apenas `null`, `0` ou `1`. |
| RN-03 | Não pode haver mais de dois valores iguais **adjacentes** na horizontal ou na vertical. A diagonal **não** é restringida. |
| RN-04 | Cada linha e cada coluna **completa** deve ter a mesma quantidade de 0 e 1 (três de cada). Em tabuleiro parcial, nenhuma linha ou coluna pode ultrapassar três 0 ou três 1. |
| RN-05 | Todas as linhas **completas** devem ser únicas. |
| RN-06 | Todas as colunas **completas** devem ser únicas. |
| RN-07 | A jogada ocorre só em posição válida (índices 0 a 5), sobre célula vazia, com valor 0 ou 1, e não pode violar RN-03 a RN-06. |
| RN-08 | Pistas fixas não podem ser alteradas nem apagadas. Uma jogada do aluno também não pode ser sobrescrita: é preciso limpar a célula antes. |
| RN-09 | Uma **solução** é um tabuleiro completamente preenchido que satisfaz RN-03, RN-04, RN-05 e RN-06. |

### Operações da implementação

A implementação está em `src/sudokuBinario.js` e expõe:

- `criarJogo(pistas?)` — cria um jogo vazio ou a partir de pistas; rejeita entradas inválidas ou que já violem as regras.
- `jogar(jogo, linha, coluna, valor)` — aplica uma jogada e devolve um **novo** estado (o original não é alterado). Em caso de violação, lança `ErroSudoku` com um `codigo`.
- `limparCelula(jogo, linha, coluna)` — remove uma jogada do aluno (não remove pista).
- `podeJogar(jogo, linha, coluna, valor)` — indica se a jogada seria aceita, sem alterar o estado.
- `validarTabuleiro(celulas)` — valida tabuleiro parcial ou completo e devolve `{ valido, codigo, mensagem }`.
- `verificarSolucao(jogoOuCelulas)` — retorna `true` somente se o tabuleiro estiver completo e correto.
- `estaCompleto(jogo)` e `obterTabuleiro(jogo)`.
- `tabuleiroParaTexto(jogoOuCelulas)` — devolve o tabuleiro como texto: célula vazia vira `.`, valores separados por espaço e linhas por `\n`, sem quebra de linha no final. Aceita uma matriz 6 × 6 ou o objeto devolvido por `criarJogo`.

`validarTabuleiro` sempre devolve um objeto com exatamente três campos: `{ valido, codigo, mensagem }`. Em sucesso, `valido` é `true` e `codigo` é `"OK"`. Em erro, `valido` é `false`, `codigo` é um dos códigos abaixo e `mensagem` é uma string não vazia.

Códigos de erro possíveis: `DIMENSAO_INVALIDA`, `VALOR_INVALIDO`, `POSICAO_INVALIDA`, `CELULA_FIXA`, `CELULA_OCUPADA`, `TRES_ADJACENTES`, `QUANTIDADE_EXCEDIDA`, `LINHA_DUPLICADA` e `COLUNA_DUPLICADA`. Os três primeiros da lista de jogada (`POSICAO_INVALIDA`, `CELULA_FIXA`, `CELULA_OCUPADA`) aparecem em `ErroSudoku` lançado por `jogar`/`limparCelula`. Os demais, além de `DIMENSAO_INVALIDA` e `VALOR_INVALIDO`, também são devolvidos por `validarTabuleiro`.

### Decisões assumidas

- A diagonal não entra na regra de adjacência (padrão Takuzu/Binairo).
- Blocos 2 × 2 com o mesmo valor são permitidos, desde que não gerem três iguais em linha ou coluna.
- A unicidade de linhas e colunas só é exigida quando a linha ou a coluna está completa. Duas linhas incompletas iguais ainda são válidas.
- O estado do jogo é **imutável**: `jogar` e `limparCelula` devolvem uma cópia.
- Não há gerador de puzzles nem solver automático; o escopo é validação, jogada e verificação de solução.

---

## Como funcionam os casos de teste

Os testes estão em `tests/sudokuBinario.test.js` e foram organizados por requisito, com casos **normais**, de **limite** e de **erro**. A solução de referência usada em vários casos é:

```
0 0 1 0 1 1
1 0 0 1 0 1
0 1 0 1 1 0
1 0 1 0 0 1
0 1 1 0 1 0
1 1 0 1 0 0
```

| ID | O que testa | Resultado esperado |
|---|---|---|
| CT-01 | Constantes do jogo e criação de tabuleiro vazio 6 × 6 | `TAMANHO === 6`, `META_POR_VALOR === 3`, `VAZIO === null`; matriz 6 × 6 só com `null`; `estaCompleto` é falso |
| CT-03 | Criação a partir de pistas válidas | Pistas preservadas; células livres permanecem vazias |
| CT-04 | Tabuleiro com número de linhas diferente de 6 | Lança `ErroSudoku` com código `DIMENSAO_INVALIDA` |
| CT-05 | Linha com número de colunas diferente de 6 | Lança `DIMENSAO_INVALIDA` |
| CT-06 | Valor numérico inválido (ex.: 2) nas pistas | Lança `VALOR_INVALIDO` |
| CT-07 | String `"0"` no lugar do bit 0 | Lança `VALOR_INVALIDO` |
| CT-08 | Isolamento da matriz de pistas (só com funções públicas) | `criarJogo` não altera a matriz de entrada; mudar a matriz depois não altera o tabuleiro obtido por `obterTabuleiro` |
| CT-09 | Isolamento de `obterTabuleiro` | Mutar a cópia não altera o jogo |
| CT-10 | Três 0 adjacentes no início da linha, nas pistas | Lança `TRES_ADJACENTES` |
| CT-11 | Jogada que forma três 1 consecutivos no meio da linha | Lança `TRES_ADJACENTES` |
| CT-12 | Jogada que forma três 0 adjacentes na vertical | Lança `TRES_ADJACENTES` |
| CT-13 | Três 1 adjacentes no final da coluna (linhas 3-4-5) | Lança `TRES_ADJACENTES` |
| CT-14 | Limite permitido: exatamente dois iguais adjacentes | Jogada aceita e tabuleiro válido |
| CT-15 | Três 0 na diagonal | Aceito (diagonal não é regra) |
| CT-16 | Quarto 0 na mesma linha, mesmo não consecutivo | Lança `QUANTIDADE_EXCEDIDA` |
| CT-17 | Quarto 1 na mesma coluna | Lança `QUANTIDADE_EXCEDIDA` |
| CT-18 | Terceiro 0 que completa a cota da linha | Jogada aceita; linha fica `001011` |
| CT-19 | Linha incompleta dentro da cota | `validarTabuleiro` verdadeiro; `verificarSolucao` falso |
| CT-20 | Completar linha com padrão já existente | Lança `LINHA_DUPLICADA` |
| CT-21 | Completar coluna com padrão já existente | Lança `COLUNA_DUPLICADA` |
| CT-22 | Duas linhas iguais ainda incompletas | Tabuleiro parcial válido |
| CT-23 | Pistas com duas colunas completas iguais | Lança `COLUNA_DUPLICADA` |
| CT-24 | Jogadas válidas de 0 e 1 em células vazias | Novo estado contém as jogadas; o original permanece vazio |
| CT-25 | Jogada fora do tabuleiro (índices -1 e 6) | Lança `POSICAO_INVALIDA` nos quatro limites |
| CT-26 | Jogada com valor 2, -1 ou `null` | Lança `VALOR_INVALIDO` |
| CT-27 | Jogada sobre pista fixa | Lança `CELULA_FIXA` |
| CT-28 | Sobrescrever célula já preenchida pelo jogador | Lança `CELULA_OCUPADA` |
| CT-29 | Limpar jogada do aluno e tentar limpar pista | Jogador consegue limpar a própria célula; pista lança `CELULA_FIXA` |
| CT-30 | `podeJogar` em casos legal, ilegal por regra, sobre pista e fora do tabuleiro | `true` só na jogada legal |
| CT-31 | `podeJogar` não altera o tabuleiro | Célula continua vazia |
| CT-32 | Solução válida conhecida | `verificarSolucao` verdadeiro e tabuleiro completo |
| CT-33 | Tabuleiro vazio não é solução | `verificarSolucao` falso |
| CT-34 | Uma única célula vazia em solução conhecida | Não é solução, mas o parcial continua válido |
| CT-35 | Tabuleiro completo com três adjacentes | Não é solução; código `TRES_ADJACENTES` |
| CT-36 | Alterar a solução para quatro 1 consecutivos na primeira linha | Não é solução; código `TRES_ADJACENTES` |
| CT-37 | Completo com 4 uns e 2 zeros, sem três adjacentes | Não é solução; código `QUANTIDADE_EXCEDIDA` |
| CT-38 | Completo com linhas duplicadas | Não é solução; código `LINHA_DUPLICADA` |
| CT-39 | Completo com colunas duplicadas (linhas únicas e demais regras ok) | Não é solução; código `COLUNA_DUPLICADA` |
| CT-40 | `verificarSolucao` com dimensão incorreta ou valor inválido | Retorna falso |
| CT-41 | Sequência de jogadas preenche as lacunas de um puzzle e chega à solução | Após três jogadas corretas, `verificarSolucao` é verdadeiro |
| CT-42 | Jogada ilegal no puzzle não altera o estado anterior | Lança erro e o tabuleiro permanece igual |
| CT-43 | Formato de sucesso de `validarTabuleiro` (parcial e solução) | Objeto exatamente `{ valido, codigo, mensagem }`, com `valido === true`, `codigo === "OK"` e `mensagem` string não vazia |
| CT-44 | `validarTabuleiro` com matriz de número de linhas errado (`[]` ou 1 linha) | `{ valido: false, codigo: "DIMENSAO_INVALIDA", mensagem }` |
| CT-45 | `validarTabuleiro` com uma linha de tamanho diferente de 6 | `{ valido: false, codigo: "DIMENSAO_INVALIDA", mensagem }` |
| CT-46 | `validarTabuleiro` com valor inválido (ex.: 2) | `{ valido: false, codigo: "VALOR_INVALIDO", mensagem }` |
| CT-47 | `validarTabuleiro` com três adjacentes | `{ valido: false, codigo: "TRES_ADJACENTES", mensagem }` |
| CT-48 | `validarTabuleiro` com quantidade excedida | `{ valido: false, codigo: "QUANTIDADE_EXCEDIDA", mensagem }` |
| CT-49 | `validarTabuleiro` com linhas completas duplicadas | `{ valido: false, codigo: "LINHA_DUPLICADA", mensagem }` |
| CT-50 | `validarTabuleiro` com colunas completas duplicadas | `{ valido: false, codigo: "COLUNA_DUPLICADA", mensagem }` |
| CT-51 | `tabuleiroParaTexto` de tabuleiro vazio | Seis linhas `. . . . . .` unidas por `\n`, sem `\n` no final |
| CT-52 | `tabuleiroParaTexto` com 0, 1 e vazios, a partir de matriz ou jogo | Vazio vira `.`; valores separados por espaço; aceita matriz e objeto de jogo |
| CT-53 | `tabuleiroParaTexto` de uma solução completa | Apenas `0` e `1` separados por espaço, linhas por `\n` |

---

## Como executar

Requisitos: Node.js 18 ou superior e npm.

```bash
cd desafio_teste_sudoku
npm install
npm test
```

O comando `npm test` executa o Jest e deve encerrar com todos os 52 casos passando.

---

## Colaborador(es)

Rodrigo A. Del Padre Filho — RA: 24042092-2
