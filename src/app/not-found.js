import NotFoundClient from "@/components/pages/NotFoundClient";

export const metadata = {
  title: "Page introuvable — Cabinet Dentaire Ilyass",
  description: "La page demandée n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return <NotFoundClient />;
}
