import type { Metadata } from 'next';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { getPolicy } from '@/data/content';
import { buildMetadata } from '@/lib/seo';

const policy = getPolicy('trocas');

export const metadata: Metadata = buildMetadata({
  title: policy?.title ?? 'Trocas e devoluções',
  description: policy?.summary ?? 'Como solicitar troca ou devolução de uma peça.',
  path: '/trocas',
});

export default function TradesPage() {
  return <PolicyPage slug="trocas" />;
}
