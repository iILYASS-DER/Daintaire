import { NextResponse } from "next/server";
import { getSettings, listDoctors, listServices, toJsonSafe } from "@/lib/server/store";
import { toHttpError } from "@/lib/server/guard";
import { msg } from "@/lib/messages";

/**
 * Contenu public (soins, praticiens, paramètres) via le serveur.
 *
 * Le navigateur lit donc exactement les mêmes données que les API de
 * réservation (repli démonstration inclus) : l'interface ne peut plus
 * proposer un soin que le serveur rejetterait, que Firestore soit vide,
 * peuplé ou que les règles de sécurité ne soient pas encore déployées.
 */
export async function GET(request) {
  try {
    const kind = new URL(request.url).searchParams.get("kind");

    if (kind === "services") {
      const items = await listServices({ activeOnly: true });
      return NextResponse.json({
        items: toJsonSafe(items),
        isDemo: items.some((s) => s.isDemo === true),
      });
    }

    if (kind === "doctors") {
      const items = await listDoctors({ activeOnly: true });
      return NextResponse.json({
        items: toJsonSafe(items),
        isDemo: items.some((d) => d.isDemo === true),
      });
    }

    if (kind === "settings") {
      const item = await getSettings();
      return NextResponse.json({
        item: toJsonSafe(item),
        isDemo: item?.isDemo === true,
      });
    }

    return NextResponse.json(
      { error: msg("error.notFound"), code: "not_found" },
      { status: 404 }
    );
  } catch (err) {
    return toHttpError(err);
  }
}
