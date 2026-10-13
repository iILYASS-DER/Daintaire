import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/server/admin-guard";
import { saveSettings } from "@/lib/server/admin-ops";
import { getSettings, toJsonSafe } from "@/lib/server/store";
import { toHttpError } from "@/lib/server/guard";

export async function GET(request) {
  try {
    await guardAdmin(request);
    const settings = await getSettings();
    return NextResponse.json({ settings: toJsonSafe(settings) });
  } catch (err) {
    return toHttpError(err);
  }
}

export async function POST(request) {
  try {
    await guardAdmin(request);
    const payload = await request.json();
    const result = await saveSettings(payload || {});
    return NextResponse.json(result);
  } catch (err) {
    return toHttpError(err);
  }
}
