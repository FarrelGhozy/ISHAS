import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/landing-page';

export const metadata: Metadata = {
  title: 'ISHAS — Assessment K3L Pesantren',
  description:
    'Kenali ISHAS, prototipe platform assessment keselamatan, kesehatan kerja, dan lingkungan pesantren. Dari instrumen dan bukti lapangan hingga hasil dan tindak lanjut.',
};

export default function Home() {
  return <LandingPage />;
}
