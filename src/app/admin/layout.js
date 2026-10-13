import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Espace staff — Cabinet Dentaire Ilyass",
  robots: { index: false, follow: false },
};

/** Gabarit de l'espace staff : garde d'authentification + navigation. */
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
