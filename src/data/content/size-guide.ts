import type { SizeGuide } from '@/types';

/**
 * Guia de tamanhos.
 *
 * Medidas em centimetros, do corpo (nao da peca). Sao valores demonstrativos:
 * ajuste conforme a tabela real de cada linha de produto.
 */
export const sizeGuide: SizeGuide = {
  unit: 'cm',
  columns: ['Tamanho', 'Busto', 'Cintura', 'Quadril'],
  rows: [
    { size: 'P', values: ['84 - 88', '64 - 68', '90 - 94'] },
    { size: 'M', values: ['89 - 93', '69 - 73', '95 - 99'] },
    { size: 'G', values: ['94 - 99', '74 - 79', '100 - 105'] },
    { size: 'GG', values: ['100 - 106', '80 - 86', '106 - 112'] },
    { size: 'XGG', values: ['107 - 114', '87 - 94', '113 - 120'] },
  ],
  note: 'Em caso de dúvida entre dois tamanhos, escolha o maior para peças de caimento reto e o menor para peças de malha.',
};

/**
 * Medidas de referencia para as pecas de baixo, exibidas na mesma janela do guia.
 */
export const sizeGuideDenim: SizeGuide = {
  unit: 'cm',
  columns: ['Tamanho', 'Cintura', 'Quadril', 'Comprimento'],
  rows: [
    { size: '36', values: ['66 - 69', '92 - 95', '100'] },
    { size: '38', values: ['70 - 73', '96 - 99', '101'] },
    { size: '40', values: ['74 - 78', '100 - 104', '102'] },
    { size: '42', values: ['79 - 83', '105 - 109', '103'] },
    { size: '44', values: ['84 - 89', '110 - 115', '104'] },
  ],
  note: 'Comprimento medido da cintura até a barra, com a peça estendida no chão.',
};
