import { NextResponse } from "next/server";
import {
  getSettings,
  listDoctors,
  listServices,
  listActiveOccupiedForDate,
  listBlockedForDate,
} from "@/lib/server/store";
import { computeAvailability } from "@/lib/availability";
import { isValidDateString } from "@/lib/validation";
import { toHttpError } from "@/lib/server/guard";
import { ApiError } from "@/lib/server/booking";
import { msg } from "@/lib/messages";

/**
 * Disponibilités publiques pour une date.
 *   GET /api/availability?date=AAAA-MM-JJ[&doctorId=…][&serviceId=…]
 *
 * Le calcul est identique à celui de la validation serveur : même moteur,
 * mêmes verrous, mêmes règles (fuseau du cabinet, délai minimum, etc.).
 * Un jour de fermeture renvoie simplement une liste vide (jamais une
 * erreur) : le visiteur voit « aucun créneau ce jour ».
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = (searchParams.get("date") || "").trim();
    const doctorId = (searchParams.get("doctorId") || "").trim();
    const serviceId = (searchParams.get("serviceId") || "").trim();

    // Date absente ou mal formée → 400, avant toute lecture Firestore.
    if (!date) throw new ApiError(400, "invalid_date", msg("error.dateRequired"));
    if (!isValidDateString(date)) {
      throw new ApiError(400, "invalid_date", msg("error.invalidDate"));
    }

    const settings = await getSettings();
    const doctors = await listDoctors({ activeOnly: true });
    const services = await listServices({ activeOnly: true });

    const service = serviceId
      ? services.find((s) => s.id === serviceId) || null
      : services[0] || null;
    // 404 uniquement si le soin ou le praticien n'existe vraiment pas.
    if (serviceId && !service) {
      throw new ApiError(404, "service_not_found", msg("error.serviceNotFound"));
    }
    if (doctorId && doctorId !== "any" && !doctors.find((d) => d.id === doctorId)) {
      throw new ApiError(404, "doctor_not_found", msg("error.doctorNotFound"));
    }

    const [occupied, blocked] = await Promise.all([
      listActiveOccupiedForDate(date),
      listBlockedForDate(date),
    ]);

    const result = computeAvailability({
      date,
      doctors,
      service,
      settings,
      occupied,
      blocked,
      doctorId,
    });

    return NextResponse.json({
      date: result.date,
      validDate: result.validDate,
      dateTooSoon: result.dateTooSoon,
      dateTooFar: result.dateTooFar,
      durationMinutes: result.durationMinutes,
      slotStepMinutes: result.slotStepMinutes,
      timezone: result.timeZone,
      perDoctor: result.perDoctor,
      slots: result.slots,
      serviceId: service?.id || null,
    });
  } catch (err) {
    return toHttpError(err);
  }
}
