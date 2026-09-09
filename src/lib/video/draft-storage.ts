import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Where uploaded draft-reel videos live. In production this should point
// at the Railway Volume's mount path (set DRAFTS_DIR to match whatever you
// mounted it at, e.g. "/data/drafts") so files survive redeploys. Falls
// back to a local .data/ directory for dev, where persistence across
// restarts doesn't matter.
function draftsDir(): string {
  return process.env.DRAFTS_DIR || path.join(process.cwd(), ".data", "drafts");
}

export function draftStoragePath(id: string, extension: string): string {
  // This directory is only ever resolved at runtime (env var or the local
  // .data fallback) — never something Turbopack's build-time file tracer
  // should try to statically resolve and bundle.
  return path.join(/* turbopackIgnore: true */ draftsDir(), `${id}${extension}`);
}

export async function saveDraftFile(storagePath: string, data: Buffer): Promise<void> {
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, data);
}

export async function readDraftFile(storagePath: string): Promise<Buffer> {
  return readFile(storagePath);
}

export async function deleteDraftFile(storagePath: string): Promise<void> {
  await rm(storagePath, { force: true });
}

export async function draftFileExists(storagePath: string): Promise<boolean> {
  try {
    await stat(storagePath);
    return true;
  } catch {
    return false;
  }
}
