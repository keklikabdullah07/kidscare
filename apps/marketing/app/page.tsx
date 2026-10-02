import type { ReactElement } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductPreview from './components/ProductPreview';
import Pricing from './components/Pricing';
import DemoForm from './components/DemoForm';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function HomePage(): ReactElement {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Features />
        <ProductPreview />
        <Pricing />
        <DemoForm />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
