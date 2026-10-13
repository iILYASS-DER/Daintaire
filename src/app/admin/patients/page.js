import PatientsClient from "@/components/admin/PatientsClient";

export const metadata = {
  title: "Patients — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminPatientsPage() {
  return <PatientsClient />;
}
