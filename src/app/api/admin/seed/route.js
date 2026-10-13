import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/server/admin-guard";
import { seedDemoData } from "@/lib/server/admin-ops";
import { toHttpError } from "@/lib/server/guard";

/** Création des données de démonstration (uniquement si les collections sont vides). */
export async function POST(request) {
  try {
    await guardAdmin(request);
    const result = await seedDemoData();
    return NextResponse.json({ ok: true, created: result });
  } catch (err) {
    return toHttpError(err);
  }
}
