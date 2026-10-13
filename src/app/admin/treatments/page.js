import TreatmentsClient from "@/components/admin/TreatmentsClient";

export const metadata = {
  title: "Plans de traitement — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminTreatmentsPage() {
  return <TreatmentsClient />;
}
