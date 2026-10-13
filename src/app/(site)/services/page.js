import ServicesClient from "@/components/pages/ServicesClient";

export const metadata = {
  title: "Nos soins dentaires — Cabinet Dentaire Ilyass, Tiflet",
  description:
    "Consultation, détartrage, soins, orthodontie, prothèses, implantologie et urgences : découvrez les soins proposés au Cabinet Dentaire Ilyass à Tiflet.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
