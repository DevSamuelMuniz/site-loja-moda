/**
 * Seed do catalogo.
 *
 * Converte o conteudo demonstrativo de `src/data/**` em dado de banco. E o passo 1 do
 * caminho de migracao descrito em `docs/platform.md`: o catalogo nao e descartado, ele
 * vira a carga inicial — o escopo §40 proibe dado ficticio como substituto de backend,
 * nao a existencia de uma carga inicial.
 *
 * Idempotente: rodar duas vezes nao duplica nada. Onde existe chave natural usa `upsert`;
 * imagens, que nao tem chave natural, sao recriadas por produto.
 *
 * Uso: `npm run db:seed` (exige `DATABASE_URL`).
 */
import { config as loadEnv } from 'dotenv';
import { brandConfig } from '@/config/brand';
import { ecommerceConfig } from '@/config/ecommerce';
import { navigationConfig } from '@/config/navigation';
import { newsBannerConfig } from '@/config/news';
import { seoConfig } from '@/config/seo';
import { socialConfig } from '@/config/social';
import { defaultThemeId, themes } from '@/config/theme';
import { whatsappConfig } from '@/config/whatsapp';
import { categories } from '@/data/categories';
import { collections } from '@/data/collections';
import { products } from '@/data/products';
import { hashPassword } from '@/lib/auth/password';
import { getPrisma } from '@/lib/db';

/* O Prisma 7 nao carrega `.env` sozinho: mesma ordem que o Next usa. */
loadEnv({ path: ['.env.local', '.env'], quiet: true });

const STORE_SLUG = 'aura';

/**
 * Configuracao da loja, chave por chave.
 *
 * Cada chave corresponde ao modulo equivalente em `src/config`. Gravar isto no banco e o
 * que permite ao lojista mudar identidade, textos e regras sem tocar em codigo (§21, §36).
 * Nesta fase o site ainda le as constantes: passar a consumir por tenant e o proximo passo.
 */
const settings: Record<string, unknown> = {
  brand: brandConfig,
  navigation: navigationConfig,
  theme: { activeThemeId: defaultThemeId, available: Object.keys(themes) },
  ecommerce: ecommerceConfig,
  seo: seoConfig,
  social: socialConfig,
  whatsapp: whatsappConfig,
  news: newsBannerConfig,
};

/**
 * Converte em algo garantidamente serializavel para uma coluna `Json` do Prisma.
 *
 * O retorno fica sem anotacao de proposito: `JSON.parse` devolve `any`, que e exatamente
 * o que o `InputJsonValue` do Prisma aceita. Anotar como objeto (o que eu fiz antes) faz o
 * TypeScript recusar a atribuicao nas colunas `Json`.
 */
function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Distribui o estoque de uma cor entre os tamanhos.
 *
 * O catalogo atual guarda estoque por cor, e o modelo da plataforma guarda por variacao
 * (escopo §8). A divisao preserva o total: o resto vai para os primeiros tamanhos.
 */
function splitStock(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function toCategoryKind(kind: string): 'AUDIENCE' | 'PRODUCT' {
  return kind === 'audience' ? 'AUDIENCE' : 'PRODUCT';
}

function toAudience(audience: string): 'FEMININO' | 'MASCULINO' | 'UNISSEX' {
  if (audience === 'feminino') return 'FEMININO';
  if (audience === 'masculino') return 'MASCULINO';
  return 'UNISSEX';
}

async function main() {
  const prisma = getPrisma();

  // -------------------------------------------------------------------------
  // Loja e configuracao
  // -------------------------------------------------------------------------
  const store = await prisma.store.upsert({
    where: { slug: STORE_SLUG },
    update: {
      name: brandConfig.name,
      legalName: brandConfig.legalName,
      currency: ecommerceConfig.currency,
      locale: ecommerceConfig.locale,
    },
    create: {
      slug: STORE_SLUG,
      name: brandConfig.name,
      legalName: brandConfig.legalName,
      currency: ecommerceConfig.currency,
      locale: ecommerceConfig.locale,
      /* Numeracao do pedido (§13): `AUR-1000`. O primeiro pedido sai com o numero inicial. */
      orderPrefix: ecommerceConfig.orders.numberPrefix,
      orderSequence: ecommerceConfig.orders.numberStart - 1,
    },
  });
  console.warn(`loja: ${store.name} (${store.slug})`);

  // -------------------------------------------------------------------------
  // Usuarios
  // -------------------------------------------------------------------------
  /* Seguranca (§23): o seed NUNCA cria conta com senha conhecida por vontade propria.
     Sem `SEED_ADMIN_PASSWORD` no ambiente nao existe usuario nenhum — assim um deploy em
     producao nao nasce com o classico `admin` / `admin`. A conta de acesso passa a ser ato
     explicito do operador, e as contas de demonstracao ficam atras de `SEED_DEMO_USERS`,
     porque senha fixa em codigo e dado ficticio que vaza para producao. */
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  let userCount = 0;

  if (adminPassword) {
    /* O login procura o e-mail em minusculas (`src/auth.ts`), entao o seed grava assim. */
    const email = (process.env.SEED_ADMIN_EMAIL?.trim() || 'admin@aura.test').toLowerCase();

    const data = {
      name: 'Ana Gestora',
      role: 'ADMIN' as const,
      active: true,
      passwordHash: await hashPassword(adminPassword),
    };

    await prisma.user.upsert({
      where: { storeId_email: { storeId: store.id, email } },
      update: data,
      create: { storeId: store.id, email, ...data },
    });

    userCount += 1;
  }

  if (process.env.SEED_DEMO_USERS === '1' || process.env.SEED_DEMO_USERS === 'true') {
    const demoUsers = [
      {
        email: 'cliente@aura.test',
        name: 'Clara Cliente',
        role: 'CUSTOMER' as const,
        active: true,
        password: 'aura-cliente-2026',
      },
      /* Inativo de proposito: existe para provar que conta desativada nao entra (§22). */
      {
        email: 'inativo@aura.test',
        name: 'Beto Inativo',
        role: 'OPERATOR' as const,
        active: false,
        password: 'aura-inativo-2026',
      },
    ];

    for (const demo of demoUsers) {
      const data = {
        name: demo.name,
        role: demo.role,
        active: demo.active,
        passwordHash: await hashPassword(demo.password),
      };

      await prisma.user.upsert({
        where: { storeId_email: { storeId: store.id, email: demo.email } },
        update: data,
        create: { storeId: store.id, email: demo.email, ...data },
      });

      userCount += 1;
    }
  }

  console.warn(
    userCount === 0
      ? 'usuarios: 0 (defina SEED_ADMIN_PASSWORD para criar a conta de acesso)'
      : `usuarios: ${userCount}`,
  );

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { storeId_key: { storeId: store.id, key } },
      update: { value: toJson(value) },
      create: { storeId: store.id, key, value: toJson(value) },
    });
  }
  console.warn(`configuracao: ${Object.keys(settings).length} chaves`);

  // -------------------------------------------------------------------------
  // Categorias
  // -------------------------------------------------------------------------
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const data = {
      name: category.name,
      kind: toCategoryKind(category.kind),
      audience: toAudience(category.audience),
      description: category.description,
      image: category.image,
      featured: category.featured ?? false,
      position: category.order,
    };

    const row = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: category.slug } },
      update: data,
      create: { storeId: store.id, slug: category.slug, ...data },
    });

    categoryIds.set(category.slug, row.id);
  }
  console.warn(`categorias: ${categoryIds.size}`);

  // -------------------------------------------------------------------------
  // Colecoes
  // -------------------------------------------------------------------------
  const collectionIds = new Map<string, string>();

  for (const collection of collections) {
    const data = {
      name: collection.name,
      tagline: collection.tagline,
      description: collection.description,
      image: collection.image,
      badge: collection.badge ?? null,
      featured: collection.featured ?? false,
      position: collection.order,
      releasedAt: new Date(collection.releasedAt),
    };

    const row = await prisma.collection.upsert({
      where: { storeId_slug: { storeId: store.id, slug: collection.slug } },
      update: data,
      create: { storeId: store.id, slug: collection.slug, ...data },
    });

    collectionIds.set(collection.slug, row.id);
  }
  console.warn(`colecoes: ${collectionIds.size}`);

  // -------------------------------------------------------------------------
  // Produtos, cores, variacoes, imagens e estoque
  // -------------------------------------------------------------------------
  let variantCount = 0;

  for (const product of products) {
    const data = {
      name: product.name,
      sku: product.sku,
      description: product.description,
      story: product.story,
      categoryId: categoryIds.get(product.category) ?? null,
      collectionId: product.collection ? (collectionIds.get(product.collection) ?? null) : null,
      status: 'ACTIVE' as const,
      audience: toAudience(product.audience),
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      tags: product.tags,
      composition: product.composition,
      care: product.care,
      details: product.details,
      measurements: toJson(product.measurements),
      ratingAvg: product.rating ?? null,
      reviewCount: product.reviewCount ?? 0,
      soldCount: product.soldCount ?? 0,
      featured: product.featured ?? false,
      isNew: product.isNew ?? false,
      /* `isSale` nao vira coluna: promocao e derivada de `compareAtPrice > price`, e a
         colecao Sale continua virtual (mesma decisao do site atual). */
      releasedAt: new Date(product.releasedAt),
    };

    const row = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: product.slug } },
      update: data,
      create: { storeId: store.id, slug: product.slug, ...data },
    });

    /* Imagem nao tem chave natural: recriar por produto mantem o seed repetivel. */
    await prisma.productImage.deleteMany({ where: { storeId: store.id, productId: row.id } });

    for (const [index, url] of product.images.entries()) {
      await prisma.productImage.create({
        data: {
          storeId: store.id,
          productId: row.id,
          url,
          position: index,
          alt: `${product.name} — imagem ${index + 1}`,
        },
      });
    }

    for (const [index, color] of product.colors.entries()) {
      const colorRow = await prisma.productColor.upsert({
        where: { productId_slug: { productId: row.id, slug: color.slug } },
        update: { name: color.name, hex: color.hex, image: color.image ?? null, position: index },
        create: {
          storeId: store.id,
          productId: row.id,
          slug: color.slug,
          name: color.name,
          hex: color.hex,
          image: color.image ?? null,
          position: index,
        },
      });

      if (color.image) {
        await prisma.productImage.create({
          data: {
            storeId: store.id,
            productId: row.id,
            colorId: colorRow.id,
            url: color.image,
            position: product.images.length + index,
            alt: `${product.name} na cor ${color.name}`,
          },
        });
      }

      const stockPerSize = splitStock(color.stock, product.sizes.length);

      for (const [sizeIndex, size] of product.sizes.entries()) {
        const quantity = stockPerSize[sizeIndex] ?? 0;

        const variant = await prisma.productVariant.upsert({
          where: { storeId_sku: { storeId: store.id, sku: `${color.sku}-${size}` } },
          update: { colorId: colorRow.id, size, position: sizeIndex },
          create: {
            storeId: store.id,
            productId: row.id,
            colorId: colorRow.id,
            size,
            sku: `${color.sku}-${size}`,
            position: sizeIndex,
          },
        });

        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: { quantity },
          create: { storeId: store.id, variantId: variant.id, quantity },
        });

        /* Movimento so na primeira carga: o historico registra o que entrou (escopo §8). */
        const movements = await prisma.inventoryMovement.count({
          where: { variantId: variant.id },
        });
        if (movements === 0 && quantity > 0) {
          await prisma.inventoryMovement.create({
            data: {
              storeId: store.id,
              variantId: variant.id,
              type: 'ADJUSTMENT',
              quantity,
              reason: 'Carga inicial do catálogo demonstrativo',
            },
          });
        }

        variantCount += 1;
      }
    }
  }
  console.warn(`produtos: ${products.length} · variacoes: ${variantCount}`);
  console.warn('seed concluido');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
