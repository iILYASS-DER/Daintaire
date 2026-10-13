import PrivacyClient from "@/components/pages/PrivacyClient";

export const metadata = {
  title: "Politique de confidentialité — Cabinet Dentaire Ilyass",
  description:
    "Comment le Cabinet Dentaire Ilyass collecte, utilise et protège vos données personnelles et vos informations de santé.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
