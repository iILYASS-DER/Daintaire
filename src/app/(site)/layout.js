import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

/** Gabarit du site public : en-tête, contenu, pied de page. */
export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
