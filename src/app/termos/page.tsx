import type { Metadata } from 'next';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { getPolicy } from '@/data/content';
import { buildMetadata } from '@/lib/seo';

const policy = getPolicy('termos');

export const metadata: Metadata = buildMetadata({
  title: policy?.title ?? 'Termos de uso',
  description: policy?.summary ?? 'Condições para navegar e comprar neste site.',
  path: '/termos',
});

export default function TermsPage() {
  return <PolicyPage slug="termos" />;
}
