import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/server/admin-guard";
import { deleteDoctor, listDoctorsAdmin, saveDoctor } from "@/lib/server/admin-ops";
import { toJsonSafe } from "@/lib/server/store";
import { toHttpError } from "@/lib/server/guard";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const doctors = await listDoctorsAdmin();
    return NextResponse.json({ doctors: toJsonSafe(doctors) });
  } catch (err) {
    return toHttpError(err);
  }
}

export async function POST(request) {
  try {
    await guardAdmin(request);
    const payload = await request.json();
    const result = await saveDoctor(payload || {});
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return toHttpError(err);
  }
}

export async function DELETE(request) {
  try {
    await guardAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    const result = await deleteDoctor(id);
    return NextResponse.json(result);
  } catch (err) {
    return toHttpError(err);
  }
}
