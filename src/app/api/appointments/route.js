import { NextResponse } from "next/server";
import { createAppointmentRequest } from "@/lib/server/booking";
import { rateLimit, clientKey, toHttpError } from "@/lib/server/guard";
import { msg } from "@/lib/messages";

export async function POST(request) {
  try {
    const limited = rateLimit(`book:${clientKey(request)}`, {
      limit: 8,
      windowMs: 60_000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: msg("error.rateLimited"), code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds || 60) } }
      );
    }

    const payload = await request.json();
    const result = await createAppointmentRequest(payload, {
      requestKey: payload?.requestKey,
      startedAt: payload?.startedAt,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return toHttpError(err);
  }
}
