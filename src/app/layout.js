import "./globals.css";
import { Inter, Cairo } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import Analytics from "@/components/Analytics";
import SkipLink from "@/components/site/SkipLink";
import RegisterSW from "@/components/RegisterSW";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cabinet Dentaire Ilyass — Dentiste à Tiflet, Hay Andalos",
    template: "%s | Cabinet Dentaire Ilyass",
  },
  description:
    "Cabinet Dentaire Ilyass à Tiflet, Hay Andalos (Maroc). Prise de rendez-vous en ligne avec validation par l'équipe : consultation, détartrage, soins, orthodontie et prothèses.",
  keywords: [
    "dentiste Tiflet",
    "cabinet dentaire Tiflet",
    "dentiste Hay Andalos",
    "rendez-vous dentiste Maroc",
    "Cabinet Dentaire Ilyass",
  ],
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: siteUrl,
    siteName: "Cabinet Dentaire Ilyass",
    title: "Cabinet Dentaire Ilyass — Dentiste à Tiflet",
    description:
      "Prenez rendez-vous en ligne au Cabinet Dentaire Ilyass, Tiflet, Hay Andalos.",
    images: [{ url: "/images/hero-dentist-patient.jpg", width: 1600, height: 1067 }],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// Applique la langue sauvegardée avant le premier rendu (pas de flash).
const languageBootstrap = `(function(){try{var l=localStorage.getItem('cdi_language');if(l==='ar'||l==='fr'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageBootstrap }} />
      </head>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        <LanguageProvider>
          <SkipLink />
          {children}
          <Analytics />
          <RegisterSW />
        </LanguageProvider>
      </body>
    </html>
  );
}
