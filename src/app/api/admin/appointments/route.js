import { NextResponse } from "next/server";
import { guardStaff as guardAdmin } from "@/lib/server/admin-guard";
import { actOnAppointment, listAppointments } from "@/lib/server/admin-ops";
import { toHttpError } from "@/lib/server/guard";
import { msg } from "@/lib/messages";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const { searchParams } = new URL(request.url);
    const items = await listAppointments({
      status: searchParams.get("status") || "",
      search: searchParams.get("search") || "",
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      doctorId: searchParams.get("doctorId") || "",
      limit: Math.min(Number(searchParams.get("limit")) || 200, 500),
    });
    return NextResponse.json({ appointments: items });
  } catch (err) {
    return toHttpError(err);
  }
}

const ACTIONS = new Set([
  "approve",
  "reject",
  "cancel",
  "complete",
  "missed",
  "reschedule",
  "assign",
  "notes",
]);

export async function POST(request) {
  try {
    const user = await guardAdmin(request);
    const payload = await request.json();
    const id = String(payload?.id || "").trim();
    const action = String(payload?.action || "");
    if (!id || !ACTIONS.has(action)) {
      return NextResponse.json(
        { error: msg("error.invalidPayload"), code: "invalid_payload" },
        { status: 400 }
      );
    }
    const result = await actOnAppointment(id, action, payload?.payload || {}, {
      actorUid: user.uid,
      actorEmail: user.email,
      actorRole: user.role,
    });
    return NextResponse.json(result || { ok: true });
  } catch (err) {
    return toHttpError(err);
  }
}
