import HomeClient from "@/components/pages/HomeClient";

export const metadata = {
  title: "Cabinet Dentaire Ilyass — Dentiste à Tiflet, Hay Andalos",
  description:
    "Prenez rendez-vous en ligne au Cabinet Dentaire Ilyass (Tiflet, Hay Andalos). Consultation, détartrage, soins, orthodontie et prothèses, avec confirmation par l'équipe du cabinet.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeClient />;
}
