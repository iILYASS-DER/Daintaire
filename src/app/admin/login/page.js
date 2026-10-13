import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion — Espace staff",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
