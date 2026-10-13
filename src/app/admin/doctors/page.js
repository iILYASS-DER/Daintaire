import DoctorsClient from "@/components/admin/DoctorsClient";

export const metadata = {
  title: "Praticiens — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminDoctorsPage() {
  return <DoctorsClient />;
}
