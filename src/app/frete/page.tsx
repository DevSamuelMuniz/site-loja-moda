import type { Metadata } from 'next';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { getPolicy } from '@/data/content';
import { buildMetadata } from '@/lib/seo';

const policy = getPolicy('frete');

export const metadata: Metadata = buildMetadata({
  title: policy?.title ?? 'Política de envio',
  description: policy?.summary ?? 'Prazos, valores de frete e rastreamento do pedido.',
  path: '/frete',
});

export default function ShippingPage() {
  return <PolicyPage slug="frete" />;
}
