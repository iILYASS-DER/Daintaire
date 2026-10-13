import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/server/admin-guard";
import { deleteService, listServicesAdmin, saveService } from "@/lib/server/admin-ops";
import { toJsonSafe } from "@/lib/server/store";
import { toHttpError } from "@/lib/server/guard";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const services = await listServicesAdmin();
    return NextResponse.json({ services: toJsonSafe(services) });
  } catch (err) {
    return toHttpError(err);
  }
}

export async function POST(request) {
  try {
    await guardAdmin(request);
    const payload = await request.json();
    const result = await saveService(payload || {});
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
    const result = await deleteService(id);
    return NextResponse.json(result);
  } catch (err) {
    return toHttpError(err);
  }
}
