import TrackClient from "@/components/pages/TrackClient";

export const metadata = {
  title: "Suivre ma demande — Cabinet Dentaire Ilyass",
  description:
    "Vérifiez l'état de votre demande de rendez-vous au Cabinet Dentaire Ilyass grâce à votre numéro de référence et votre téléphone.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return <TrackClient />;
}
