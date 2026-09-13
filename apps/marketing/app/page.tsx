import type { ReactElement } from 'react';

export default function Home(): ReactElement {
  return (
    <main
      style={{
        fontFamily: 'system-ui',
        padding: '4rem 2rem',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <h1>KidsCare</h1>
      <p>Çocuğunuzun kreş günü, tek bir uygulamada.</p>
    </main>
  );
}
