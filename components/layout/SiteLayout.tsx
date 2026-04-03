import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Pass true on the homepage so hero text sits under transparent nav */
  heroPage?: boolean;
}

export default function SiteLayout({ children, heroPage = false }: SiteLayoutProps) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: heroPage ? 0 : "64px" }}>
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
