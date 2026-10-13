import ContactClient from "@/components/pages/ContactClient";

export const metadata = {
  title: "Contact — Cabinet Dentaire Ilyass, Tiflet",
  description:
    "Contactez le Cabinet Dentaire Ilyass (Tiflet, Hay Andalos) : téléphone, e-mail, adresse, horaires et formulaire de message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
