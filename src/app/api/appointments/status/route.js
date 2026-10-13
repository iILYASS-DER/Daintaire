import { NextResponse } from "next/server";
import { getAppointmentStatus } from "@/lib/server/booking";
import { rateLimit, clientKey, toHttpError } from "@/lib/server/guard";
import { msg } from "@/lib/messages";

export async function POST(request) {
  try {
    const limited = rateLimit(`track:${clientKey(request)}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: msg("error.rateLimited"), code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds || 60) } }
      );
    }

    const payload = await request.json();
    const result = await getAppointmentStatus(payload?.reference, payload?.phone);
    return NextResponse.json(result);
  } catch (err) {
    return toHttpError(err);
  }
}
