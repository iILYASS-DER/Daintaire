import { NextResponse } from "next/server";
import { CONTACT_MAX_LEN } from "@/lib/constants";
import { rateLimit, clientKey, toHttpError, requireAdmin } from "@/lib/server/guard";
import { ApiError } from "@/lib/server/booking";
import { fetchCollection, fsDoc, fsQuery, srvTs } from "@/lib/server/store";
import { COLLECTIONS } from "@/lib/constants";
import { msg, validationMessage } from "@/lib/messages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Validation du formulaire de contact (sans dépendance externe). */
function validate(payload = {}) {
  const name = String(payload.name || "").trim().replace(/\s+/g, " ");
  const email = String(payload.email || "").trim();
  const phone = String(payload.phone || "").trim();
  const subject = String(payload.subject || "").trim();
  const message = String(payload.message || "").trim();
  const website = String(payload.website || "");

  const errors = [];
  if (name.length < 2 || name.length > 120) errors.push("form.error.nameRequired");
  if (!email || email.length > 200 || !EMAIL_RE.test(email))
    errors.push("form.error.emailInvalid");
  if (phone && !/^\+?[0-9\s-]{9,20}$/.test(phone)) errors.push("form.error.phoneInvalid");
  if (subject.length < 2 || subject.length > 200) errors.push("form.error.invalid");
  if (message.length < 10 || message.length > CONTACT_MAX_LEN)
    errors.push("form.error.messageTooShort");
  if (payload.consent !== true && payload.consent !== "true")
    errors.push("form.error.invalid");

  return {
    valid: errors.length === 0 && website === "",
    errors,
    clean: { name, email, phone, subject, message },
    honeypot: website !== "",
  };
}

export async function POST(request) {
  try {
    const limited = rateLimit(`contact:${clientKey(request)}`, {
      limit: 4,
      windowMs: 5 * 60_000,
    });
    if (!limited.ok) throw new ApiError(429, "rate_limited", msg("error.rateLimited"));

    const payload = await request.json();
    const result = validate(payload);

    // Pot de miel rempli : robot. On répond comme un succès (sans rien écrire).
    if (result.honeypot) return NextResponse.json({ ok: true }, { status: 201 });

    if (!result.valid) {
      throw new ApiError(
        422,
        "validation_failed",
        validationMessage(result.errors[0] || "form.error.invalid")
      );
    }

    const id = `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    try {
      await fsDoc(`${COLLECTIONS.CONTACT_MESSAGES}/${id}`).set({
        ...result.clean,
        consent: true,
        status: "new",
        createdAt: srvTs(),
        createdAtMs: Date.now(),
      });
    } catch (writeError) {
      const { isPermissionDenied, RULES_MISSING_MESSAGE } = await import(
        "@/lib/server/firebase-errors"
      );
      if (isPermissionDenied(writeError)) {
        throw new ApiError(503, "firestore_rules_missing", RULES_MISSING_MESSAGE);
      }
      throw writeError;
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return toHttpError(err);
  }
}

/** Liste des messages reçus (administration). */
export async function GET(request) {
  try {
    await requireAdmin(request);
    const rows = await fetchCollection(
      fsQuery(COLLECTIONS.CONTACT_MESSAGES, {
        orders: [{ field: "createdAtMs", dir: "desc" }],
        limit: 100,
      })
    );
    return NextResponse.json({ messages: rows });
  } catch (err) {
    return toHttpError(err);
  }
}
