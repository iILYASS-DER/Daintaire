/**
 * Résout l'alias de chemin "@/…" utilisé dans le code source, pour que les
 * tests Node puissent importer les modules directement.
 * Usage : node --import ./scripts/register-alias.mjs --test tests/
 */
import { register } from "node:module";

register("./alias-loader.mjs", import.meta.url);
