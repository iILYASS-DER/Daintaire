import SettingsClient from "@/components/admin/SettingsClient";

export const metadata = {
  title: "Paramètres — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
