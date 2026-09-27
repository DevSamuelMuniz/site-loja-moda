import type { Metadata } from 'next';
import { PolicyPage } from '@/components/layout/PolicyPage';
import { getPolicy } from '@/data/content';
import { buildMetadata } from '@/lib/seo';

const policy = getPolicy('privacidade');

export const metadata: Metadata = buildMetadata({
  title: policy?.title ?? 'Política de privacidade',
  description: policy?.summary ?? 'Quais dados a loja coleta e como você pode solicitar acesso.',
  path: '/privacidade',
});

export default function PrivacyPage() {
  return <PolicyPage slug="privacidade" />;
}
