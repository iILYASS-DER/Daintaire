import AboutClient from "@/components/pages/AboutClient";

export const metadata = {
  title: "Le cabinet — Cabinet Dentaire Ilyass, Tiflet",
  description:
    "Découvrez le Cabinet Dentaire Ilyass à Tiflet (Hay Andalos) : notre approche de soins, notre environnement et l'équipe qui vous reçoit.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}
