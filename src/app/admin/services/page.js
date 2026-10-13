import ServicesClient from "@/components/admin/ServicesClient";

export const metadata = {
  title: "Soins — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminServicesPage() {
  return <ServicesClient />;
}
