import { Suspense } from "react";
import BookingClient from "@/components/pages/BookingClient";
import Spinner from "@/components/ui/Spinner";

export const metadata = {
  title: "Prendre rendez-vous — Cabinet Dentaire Ilyass, Tiflet",
  description:
    "Demandez un rendez-vous en ligne au Cabinet Dentaire Ilyass (Tiflet, Hay Andalos) en 5 étapes : soin, praticien, date, coordonnées et vérification.",
  alternates: { canonical: "/appointment" },
};

export default function AppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <BookingClient />
    </Suspense>
  );
}
