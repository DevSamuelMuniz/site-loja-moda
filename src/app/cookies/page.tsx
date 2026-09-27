import type { Metadata } from 'next';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { getPolicy } from '@/data/content';
import { buildMetadata } from '@/lib/seo';

const policy = getPolicy('cookies');

export const metadata: Metadata = buildMetadata({
  title: policy?.title ?? 'Cookies e armazenamento local',
  description:
    policy?.summary ?? 'O que fica salvo no seu navegador e como recusar cookies de medição.',
  path: '/cookies',
});

export default function CookiesPage() {
  return <PolicyPage slug="cookies" />;
}
