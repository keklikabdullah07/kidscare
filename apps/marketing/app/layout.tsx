import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'KidsCare — Yeni Nesil Kreş & Anaokulu Yönetim Ekosistemi',
  description:
    'Yoklamadan günlük karneye, anlık veli bildirimlerinden güvenli teslimata — kreşinizi tek merkezden yönetin, velilerinizin güvenini kazanın.',
  keywords: [
    'kreş yönetim sistemi',
    'anaokulu programı',
    'kreş veli bilgilendirme uygulaması',
    'günlük kreş karnesi',
    'kreş yoklama takip',
    'güvenli çocuk teslimi',
    'KidsCare',
  ],
  authors: [{ name: 'KidsCare Technologies' }],
  openGraph: {
    title: 'KidsCare — Yeni Nesil Kreş & Anaokulu Yönetim Ekosistemi',
    description:
      'Kreşinizi tek merkezden yönetin, velilerinizin güvenini kazanın. Yoklama, anlık bildirim, dijital karne ve ilaç takibi tek çatı altında.',
    url: 'https://kidscare.abdullahkeklik.com',
    siteName: 'KidsCare',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KidsCare — Yeni Nesil Kreş & Anaokulu Yönetim Ekosistemi',
    description: 'Kreşinizi tek merkezden yönetin, velilerinizin güvenini kazanın.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#0F4C3A" />
      </head>
      <body>{children}</body>
    </html>
  );
}
