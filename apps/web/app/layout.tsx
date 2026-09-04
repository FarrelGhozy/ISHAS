import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISHAS — Prototipe Dashboard K3L',
  description:
    'Prototipe frontend Integrated Safety and Health Assessment System.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
