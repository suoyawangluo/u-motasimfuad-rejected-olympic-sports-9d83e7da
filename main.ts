// Rejected Olympic Sports — one funny single-line sport the Olympics turned down.
// Entry: synchronised queueing. A real-enough event a broadcaster would have to
// explain with a straight face; the twist ("or their temper") lands in the last beat.
// Gate (RULES.txt): /output/entry.txt must be UTF-8 text, 1-200 characters, non-blank.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry, assembled from named parts so each beat earns its place.
const PARTS = {
  event: "Synchronised queueing",
  arena: "four athletes, one post office counter",
  stakes: "gold for whoever reaches the front without once losing their place",
  twist: "or their temper",
} as const;

function buildEntry(): string {
  return `${PARTS.event}: ${PARTS.arena}, ${PARTS.stakes} — ${PARTS.twist}.`;
}

type GateReport = { ok: boolean; codePoints: number; lines: number };

function validateEntry(text: string): GateReport {
  const codePoints = [...text].length;
  const lines = text.split("\n").length;
  const ok =
    codePoints >= 1 && codePoints <= 200 && text.trim().length > 0 && lines === 1;
  return { ok, codePoints, lines };
}

function verifyWritten(outPath: string, expected: string): string {
  const written = readFileSync(outPath, "utf8");
  if (written !== expected) throw new Error("read-back mismatch");
  return createHash("sha256").update(written, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const gate = validateEntry(entry);
  if (!gate.ok) {
    throw new Error(`gate failed: ${gate.codePoints} characters, ${gate.lines} lines`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry, "utf8");
  const sha256 = verifyWritten(outPath, entry);
  console.log(
    `gate passes: ${gate.codePoints} characters, ${gate.lines} line, sha256 ${sha256}`,
  );
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
