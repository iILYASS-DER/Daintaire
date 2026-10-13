/**
 * Le fichier src/lib/messages.js est l'ENDROIT UNIQUE des messages
 * d'erreur / validation / toast / états vides. Chaque entrée doit
 * obligatoirement être complète : anglais (canonique, renvoyé par l'API)
 * + français + arabe (affichés par l'interface).
 */
import test from "node:test";
import assert from "node:assert/strict";

import { MESSAGES, msg, validationMessage, UI_MESSAGES } from "@/lib/messages";
import { messages as i18n } from "@/lib/i18n.js";

test("chaque message possède en / fr / ar non vides", () => {
  for (const [key, entry] of Object.entries(MESSAGES)) {
    assert.ok(entry.en && entry.en.trim(), `${key} : en manquant`);
    assert.ok(entry.fr && entry.fr.trim(), `${key} : fr manquant`);
    assert.ok(entry.ar && entry.ar.trim(), `${key} : ar manquant`);
  }
});

test("msg() renvoie le texte anglais canonique", () => {
  assert.equal(msg("error.invalidDate"), MESSAGES["error.invalidDate"].en);
  // Clé inconnue → message générique, jamais undefined.
  assert.ok(msg("does.not.exist").length > 0);
});

test("validationMessage() traduit les clés de validation, repli sinon", () => {
  assert.equal(
    validationMessage("form.error.dateInvalid"),
    MESSAGES["form.error.dateInvalid"].en
  );
  assert.equal(validationMessage("unknown.key"), MESSAGES["error.invalidPayload"].en);
});

test("le dictionnaire i18n expose bien les messages centralisés", () => {
  for (const [key, entry] of Object.entries(UI_MESSAGES)) {
    assert.deepEqual(i18n[key], entry, `i18n[${
      typeof key === "string" ? key : JSON.stringify(key)
    }] diverge de messages.js`);
  }
  // Clés historiques toujours résolubles côté client.
  assert.ok(i18n["form.error.dateInvalid"]);
  assert.ok(i18n["error.internal"]);
  assert.ok(i18n["admin.serverNotConfigured"]);
});
