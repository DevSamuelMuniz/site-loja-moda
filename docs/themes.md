# Temas

A identidade visual é um **dado**, não uma constante espalhada pelo CSS. Trocar de tema não
exige alterar nenhum componente.

## Como funciona

```
src/config/theme.ts        tokens de cada tema (cor, tipografia, raio, sombra, botão)
        │
        ▼
src/lib/theme.ts           Theme Engine: converte tokens em variáveis CSS
        │
        ▼
<html style={…}>           :root { --color-primary: … }  +  [data-theme="luxury"] { … }
        │
        ▼
src/styles/theme.css       @theme inline mapeia as variáveis para utilitários do Tailwind
        │
        ▼
bg-primary · text-muted · rounded-sm · shadow-card · type-display
```

Por causa do `@theme inline`, o Tailwind **não** emite cópia das variáveis: `bg-primary`
compila para `background-color: var(--color-primary)`. Quem manda no valor é sempre o tema
ativo.

## Variáveis disponíveis

### Cor

| Variável | Utilitários | Uso |
| --- | --- | --- |
| `--color-primary` | `bg-primary` `text-primary` `border-primary` | Texto principal e botão cheio |
| `--color-primary-foreground` | `text-primary-foreground` | Texto sobre o primário |
| `--color-background` | `bg-background` | Fundo da página |
| `--color-foreground` | `text-foreground` | Texto padrão |
| `--color-muted` | `text-muted` | Texto secundário |
| `--color-surface` | `bg-surface` | Superfície elevada (cards de imagem, faixas) |
| `--color-border` | `border-border` `divide-border` | Filetes e divisores |
| `--color-accent` | `bg-accent` `text-accent` | Destaque, foco e selos |
| `--color-accent-foreground` | `text-accent-foreground` | Texto sobre o destaque |
| `--color-success` | `text-success` | Confirmação |
| `--color-danger` | `text-danger` | Promoção, erro, remoção |
| `--color-overlay` | `bg-overlay` | Véu atrás de modais e painéis |

### Tipografia

| Variável | Utilitário | Uso |
| --- | --- | --- |
| `--font-display` | `font-display` | Títulos e números grandes |
| `--font-body` | `font-body` `font-sans` | Texto e interface |
| `--weight-display` | `type-display` | Peso dos títulos |
| `--weight-heading` | `type-heading` | Peso dos subtítulos |
| `--weight-body` | `type-body` | Peso do texto |
| `--weight-label` | `type-label` | Peso dos rótulos pequenos |
| `--tracking-display` | `type-display` `type-heading` | Espaçamento entre letras dos títulos |
| `--tracking-label` | `type-label` | Espaçamento dos rótulos |
| `--heading-transform` | `type-display` `type-heading` | `none` ou `uppercase` |

### Raio, sombra e botão

`--radius-sm|md|lg|xl|pill` → `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`,
`rounded-pill`.
`--shadow-hairline|card|lifted|overlay` → `shadow-hairline`, `shadow-card`, `shadow-lifted`,
`shadow-overlay`.
`--button-weight`, `--button-tracking`, `--button-transform` → usados pelo utilitário
`type-button`.

## Temas prontos

| Id | Caráter |
| --- | --- |
| `minimal` | Base clara, preto tipográfico e dourado discreto. **Padrão** |
| `luxury` | Papel quente, filetes finos, tipografia muito leve, cantos retos |
| `streetwear` | Tipografia pesada, alto contraste, laranja de sinalização |
| `feminine` | Blush, rosas empoeirados e cantos generosos |
| `bold` | Violeta elétrico sobre branco puro |
| `sport` | Cinza técnico com verde de performance |
| `corporate` | Azul institucional e cinzas frios |
| `custom` | Modelo vazio, para a sua identidade |

## Trocar o tema

**Por variável de ambiente** (aplica no build):

```bash
NEXT_PUBLIC_THEME=luxury
```

**Em tempo de execução**, pelo atributo no `<html>` — todos os temas já vêm no CSS:

```js
document.documentElement.dataset.theme = 'streetwear';
```

Para fixar em um tema, defina o atributo no layout raiz:

```tsx
// src/app/layout.tsx
<html lang={seoConfig.languageTag} className={fontVariables} data-theme="feminine">
```

## Criar um tema novo

1. Abra `src/config/theme.ts`.
2. Adicione o id em `ThemeId` (`src/types/theme.ts`).
3. Copie o bloco de `minimal` no registro `themes` e ajuste os valores.
4. Aplique com `NEXT_PUBLIC_THEME=<id>` ou `data-theme="<id>"`.

O tema `custom` existe justamente para isso: ele é um ponto de partida neutro, com um
comentário explicando como usá-lo.

## Como o tema chega ao navegador sem piscar

`src/lib/theme.ts` gera uma string de CSS e o layout raiz a renderiza em uma tag `<style>` com
`precedence`:

```tsx
<style {...themeStyleProps}>{themeCss()}</style>
```

O React 19 eleva essa tag para o `<head>`, então o tema já está aplicado no HTML do servidor —
não existe flash de estilo sem tema, e nada de JavaScript é necessário para pintar a página.

## Escala tipográfica

A escala vive em `src/styles/theme.css` (`@theme`), com `clamp()` para não exigir um ponto de
quebra por tamanho de tela:

| Utilitário | Uso |
| --- | --- |
| `text-display-2xl` | Hero |
| `text-display-xl` | Título de página e banners |
| `text-display-lg` | Título de seção e do produto |
| `text-heading-lg` | Título de bloco |
| `text-heading-md` | Título de card e de item |
| `text-body-lg` | Texto de apoio grande |
| `text-body` | Texto padrão |
| `text-body-sm` | Texto secundário |
| `text-label` | Rótulos pequenos |

Combinado com os utilitários de tipo, o uso típico é:
`<h1 className="type-display text-display-lg">`.

## Movimento

Uma regra organiza tudo: **animação que responde a uma ação, ou um único momento
orquestrado**. Não existe fade-and-slide repetido em cada seção — quando tudo entra animado ao
mesmo tempo, nada parece intencional e a página fica mais lenta de ler.

### Tokens — `src/styles/tokens.css`

| Token | Valor | Uso |
| --- | --- | --- |
| `--duration-fast` | 140ms | Microinterações: hover, press |
| `--duration-exit` | 180ms | Saída de painéis e modais |
| `--duration-base` | 240ms | Transições de cor e de estado |
| `--duration-enter` | 260ms | Entrada de painéis e modais |
| `--duration-slow` | 520ms | Imagens, altura de sanfona, medidores |
| `--duration-reveal` | 720ms | Entradas de texto da primeira dobra |
| `--duration-hero` | 1100ms | Fotografia do hero |
| `--stagger-step` | 70ms | Intervalo entre os passos da sequência |
| `--ease-out-expo` | — | Entradas: desacelera no fim |
| `--ease-out-quart` | — | Fades |
| `--ease-in-out-soft` | — | Saídas |
| `--ease-spring` | — | Confirmações: leve ultrapassagem |

### Utilitários — `src/styles/theme.css`

| Utilitário | Onde aparece |
| --- | --- |
| `reveal-step-1` `-2` `-3` | Sequência de entrada do hero: título, apoio, ações |
| `reveal-image` | Fotografia do hero, abrindo uma vez |
| `reveal-fade` | Apoios que não devem se deslocar |
| `overlay-enter` `overlay-exit` | Véu de painéis e modais |
| `panel-enter-right` `panel-exit-right` `-left` | Sacola, menu mobile e filtros |
| `modal-enter` `modal-exit` | Modais e a busca |
| `pop-in` | Confirmação: favorito, tamanho adicionado, contador da sacola |
| `status-in` | Retorno de formulário |
| `reveal-view` | Revelação por rolagem, em blocos editoriais |

A saída de painéis é coordenada por `src/lib/overlay-motion.ts` (`useOverlayMotion`): o
componente reserva a duração de saída antes de desmontar, para que fechar pelo `X`, pelo
`Esc` ou pelo véu não seja um corte seco.

`reveal-view` usa animações dirigidas por rolagem, então roda sem JavaScript e só se aplica
onde há suporte. Em navegadores sem suporte o bloco é ignorado e o conteúdo aparece normal.

### Ajustar ou desligar

- **Velocidade:** edite os tokens em `src/styles/tokens.css`.
- **Mais discreto:** reduza `--stagger-step` e `--duration-reveal`.
- **Menos movimento no sistema:** `prefers-reduced-motion` já neutraliza durações e atrasos em
  `src/styles/theme.css`, inclusive a revelação por rolagem.
- **Desligar de vez:** remova as classes `reveal-*` dos componentes; nada depende delas para
  ficar visível.
