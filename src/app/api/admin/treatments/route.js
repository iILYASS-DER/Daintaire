import { NextResponse } from "next/server";
import { guardStaff as guardAdmin } from "@/lib/server/admin-guard";
import {
  createTreatmentPlan,
  deleteTreatmentPlan,
  listTreatmentPlans,
  saveTreatmentSession,
  updateTreatmentSessionStatus,
} from "@/lib/server/admin-ops";
import { toHttpError } from "@/lib/server/guard";
import { msg } from "@/lib/messages";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const data = await listTreatmentPlans();
    return NextResponse.json(data);
  } catch (err) {
    return toHttpError(err);
  }
}

/**
 * Corps attendu :
 *  { kind: "plan.create", input }
 *  { kind: "plan.delete", id }
 *  { kind: "session.save", planId, input }
 *  { kind: "session.status", id, status }
 */
export async function POST(request) {
  try {
    await guardAdmin(request);
    const body = await request.json();
    switch (body?.kind) {
      case "plan.create": {
        const result = await createTreatmentPlan(body.input || {});
        return NextResponse.json(result, { status: 201 });
      }
      case "plan.delete": {
        const result = await deleteTreatmentPlan(String(body.id || ""));
        return NextResponse.json(result);
      }
      case "session.save": {
        const result = await saveTreatmentSession(
          String(body.planId || ""),
          body.input || {}
        );
        return NextResponse.json(result, { status: 201 });
      }
      case "session.status": {
        const result = await updateTreatmentSessionStatus(
          String(body.id || ""),
          String(body.status || "")
        );
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json(
          { error: msg("error.invalidPayload"), code: "invalid_payload" },
          { status: 400 }
        );
    }
  } catch (err) {
    return toHttpError(err);
  }
}
