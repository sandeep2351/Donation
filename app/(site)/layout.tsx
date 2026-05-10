import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <Footer />
    </>
  );
}
