import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * ESLint com flat config.
 *
 * O `eslint-config-next` 16 exporta configuracao flat nativa em
 * `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript`, entao nao ha
 * mais necessidade de adaptar a configuracao antiga com `FlatCompat`.
 *
 * A ordem importa: primeiro os ignores, depois as regras do Next, depois o desligamento
 * das regras de estilo que o Prettier assume.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'out/**',
      'public/**',
      /* Cliente gerado pelo Prisma: codigo de terceiro, nao se revisa com lint. */
      'src/generated/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export default config;
