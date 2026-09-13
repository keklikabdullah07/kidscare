import type { ReactElement, ReactNode } from 'react';

export const metadata = {
  title: 'KidsCare',
  description: 'Çocuğunuzun kreş günü, tek bir uygulamada.',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
