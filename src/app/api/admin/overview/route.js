import { NextResponse } from "next/server";
import { guardStaff as guardAdmin } from "@/lib/server/admin-guard";
import { getOverview, listAppointments } from "@/lib/server/admin-ops";
import { toHttpError } from "@/lib/server/guard";
import { isServerConfigured } from "@/lib/server/firebase-admin";

export async function GET(request) {
  try {
    if (!isServerConfigured()) {
      const { notConfigured } = await import("@/lib/server/admin-guard");
      return notConfigured();
    }
    await guardAdmin(request);
    const [overview, appointments] = await Promise.all([
      getOverview(),
      listAppointments({ limit: 50 }),
    ]);
    return NextResponse.json({ overview, recent: appointments.slice(0, 20) });
  } catch (err) {
    return toHttpError(err);
  }
}
