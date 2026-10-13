import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Uniquement les sources du projet : ne JAMAIS forcer ESM sur un fichier
// node_modules dont le chemin contient "/src/" (ex. @grpc/grpc-js/build/src/).
const SRC_URL = new URL("../src/", import.meta.url).href;

function withExtension(target) {
  if (existsSync(target)) return target;
  if (existsSync(`${target}.js`)) return `${target}.js`;
  if (existsSync(path.join(target, "index.js"))) return path.join(target, "index.js");
  return target;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = withExtension(path.join(ROOT, "src", specifier.slice(2)));
    return nextResolve(pathToFileURL(target).href, context);
  }
  // Extensions omises : imports relatifs du type "../src/lib/xxx"
  if (specifier.startsWith(".") && context.parentURL?.endsWith(".js")) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error.code === "ERR_MODULE_NOT_FOUND") {
        const base = fileURLToPath(new URL(specifier, context.parentURL));
        const target = withExtension(base);
        if (existsSync(target)) return nextResolve(pathToFileURL(target).href, context);
      }
      throw error;
    }
  }
  return nextResolve(specifier, context);
}

/** Force les fichiers sources ESM (package.json sans "type":"module"). */
export async function load(url, context, nextLoad) {
  if (url.startsWith(SRC_URL) && url.endsWith(".js")) {
    return nextLoad(url, { ...context, format: "module" });
  }
  return nextLoad(url, context);
}
