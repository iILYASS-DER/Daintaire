import { NextResponse } from "next/server";
import { verifyBearerToken, isServerConfigured } from "@/lib/server/firebase-admin";
import { toHttpError } from "@/lib/server/guard";
import { ApiError } from "@/lib/server/booking";
import { fetchDoc, fsDoc, privileged } from "@/lib/server/store";
import { COLLECTIONS } from "@/lib/constants";
import { msg } from "@/lib/messages";

/**
 * Identité de l'utilisateur connecté (uid, e-mail, rôle).
 * Utilisé par l'espace staff pour déterminer les droits affichés.
 */
export async function GET(request) {
  try {
    if (!isServerConfigured()) {
      throw new ApiError(503, "server_not_configured", msg("error.serverNotConfigured"));
    }

    const user = await verifyBearerToken(request.headers.get("authorization"));
    let role = user.role;

    if (!role && privileged()) {
      const record = await fetchDoc(fsDoc(`${COLLECTIONS.USERS}/${user.uid}`));
      role = record?.role || null;
    }

    return NextResponse.json({
      uid: user.uid,
      email: user.email || "",
      role: role || null,
    });
  } catch (err) {
    return toHttpError(err);
  }
}
