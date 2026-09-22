export const metadata = {
    title: 'KidsCare',
    description: 'Çocuğunuzun kreş günü, tek bir uygulamada.',
};
export default function RootLayout({ children }) {
    return (<html lang="tr">
      <body>{children}</body>
    </html>);
}
