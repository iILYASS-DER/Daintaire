import AppointmentsClient from "@/components/admin/AppointmentsClient";

export const metadata = {
  title: "Rendez-vous — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminAppointmentsPage() {
  return <AppointmentsClient />;
}
