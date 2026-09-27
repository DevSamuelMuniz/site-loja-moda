import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Section, SectionHeader } from '@/components/layout/Section';
import { socialConfig } from '@/config/social';
import { imageSizes } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { InstagramPost } from '@/types';

/**
 * Grade do Instagram.
 *
 * Cada imagem tem link proprio e uma legenda acessivel. A secao inteira pode ser
 * desligada por `socialConfig.instagramGridEnabled`.
 */
export function InstagramGrid({
  posts,
  className,
}: {
  posts: InstagramPost[];
  className?: string;
}) {
  if (!socialConfig.instagramGridEnabled || posts.length === 0) return null;

  const profileUrl = socialConfig.links.find((link) => link.id === 'instagram')?.href;

  return (
    <Section id="instagram" labelledBy="instagram-titulo" className={className}>
      <Container>
        <SectionHeader
          id="instagram-titulo"
          title={socialConfig.handle}
          description="Os bastidores da coleção, os lançamentos e os looks que a gente monta com as peças da coleção."
          action={
            profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="type-button text-body link-rule"
              >
                Seguir no Instagram
              </a>
            ) : undefined
          }
        />

        <ul className="mt-10 grid grid-cols-2 gap-[var(--layout-grid-gap)] sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className={cn('group relative block aspect-square w-full overflow-hidden')}
              >
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  sizes={imageSizes.instagram}
                  className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
