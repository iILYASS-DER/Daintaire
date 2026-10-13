import { NextResponse } from "next/server";
import { guardStaff as guardAdmin } from "@/lib/server/admin-guard";
import { listPatients } from "@/lib/server/admin-ops";
import { toHttpError } from "@/lib/server/guard";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const { searchParams } = new URL(request.url);
    const patients = await listPatients({
      search: searchParams.get("search") || "",
    });
    return NextResponse.json({ patients });
  } catch (err) {
    return toHttpError(err);
  }
}
