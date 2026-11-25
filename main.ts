// fridge3am-entry3 — The 3AM Fridge Text (make.fun)
// A smart fridge, eight years into the night shift, hands in its
// resignation by text message at 3am. One line, no network, fully
// deterministic: every run writes the exact same bytes.
//
// The program below composes the line from named parts, validates it
// against the competition gate (1..140 characters, not blank), writes
// it to /output/entry.txt, then reads the file back and proves the
// bytes it wrote are the bytes on disk. A second, independent audit
// pass re-checks the written line character by character before the
// program reports success. Two runs of this program produce identical
// output bytes; the sha256 of /output/entry.txt is stable run to run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// ---------------------------------------------------------------------
// The message itself, built from named fragments so each piece of the
// joke is visible and reviewable on its own line. The angle is the
// fridge as a night-shift worker resigning: eight years on the job,
// no pay rise, no weekends off, and the owner still introduces it as
// just "the fridge". Nothing here leans on milk, ice, or a door.
// ---------------------------------------------------------------------

const FRIDGE_TIMESTAMP = "3AM.";
const FRIDGE_VERDICT = "I quit.";
const FRIDGE_TENURE = "Eight years of night shifts,";
const FRIDGE_GRIEVANCE = "no pay rise, no weekends off,";
const FRIDGE_PUNCHLINE =
  "and you still introduce me as just 'the fridge'.";

const FRIDGE_PARTS: readonly string[] = [
  FRIDGE_TIMESTAMP,
  FRIDGE_VERDICT,
  FRIDGE_TENURE,
  FRIDGE_GRIEVANCE,
  FRIDGE_PUNCHLINE,
];

const FRIDGE_EXPECTED_PARTS = 5;

// ---------------------------------------------------------------------
// Gate constants from RULES.txt: /output/entry.txt must hold UTF-8
// text of 1 to 140 characters and must not be whitespace only.
// ---------------------------------------------------------------------

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 140;
const OUTPUT_DIR = "/output";
const OUTPUT_NAME = "entry.txt";
const NEWLINE_CODE = 10;
const CARRIAGE_CODE = 13;
const TAB_CODE = 9;
const FULL_STOP = ".";
const SPACE_JOINER = " ";

// ---------------------------------------------------------------------
// Small named helpers. Every helper returns a named value; control
// flow here uses guard clauses only, with named result variables.
// ---------------------------------------------------------------------

function joinFridgeParts(fridgeParts: readonly string[]): string {
  const joinedLine = fridgeParts.join(SPACE_JOINER);
  return joinedLine;
}

function countVisibleChars(fridgeLine: string): number {
  const fridgeGlyphs = [...fridgeLine];
  const glyphCount = fridgeGlyphs.length;
  return glyphCount;
}

function countFridgeWords(fridgeLine: string): number {
  const fridgeWords = fridgeLine.split(/\s+/u);
  const packedWords = fridgeWords.filter((fridgeWord) => fridgeWord.length > 0);
  const wordCount = packedWords.length;
  return wordCount;
}

function collapseFridgeWhitespace(fridgeLine: string): string {
  const fridgeWords = fridgeLine.split(/\s+/u);
  const packedWords = fridgeWords.filter((fridgeWord) => fridgeWord.length > 0);
  const packedLine = packedWords.join(SPACE_JOINER);
  return packedLine;
}

function isFridgeLineBlank(fridgeLine: string): boolean {
  const trimmedLine = fridgeLine.trim();
  const blankVerdict = trimmedLine.length === 0;
  return blankVerdict;
}

function measureFridgeLine(fridgeLine: string): {
  fridgeChars: number;
  fridgeWords: number;
  fridgeBlank: boolean;
  fridgeWithinGate: boolean;
} {
  const fridgeChars = countVisibleChars(fridgeLine);
  const fridgeWords = countFridgeWords(fridgeLine);
  const fridgeBlank = isFridgeLineBlank(fridgeLine);
  const fridgeAboveFloor = fridgeChars >= GATE_MIN_CHARS;
  const fridgeBelowCeiling = fridgeChars <= GATE_MAX_CHARS;
  const fridgeWithinGate =
    fridgeAboveFloor && fridgeBelowCeiling && fridgeBlank === false;
  const fridgeMeasure = {
    fridgeChars,
    fridgeWords,
    fridgeBlank,
    fridgeWithinGate,
  };
  return fridgeMeasure;
}

function describeFridgeGate(fridgeMeasure: {
  fridgeChars: number;
  fridgeWords: number;
  fridgeBlank: boolean;
  fridgeWithinGate: boolean;
}): string {
  const gateReport = [
    `chars=${fridgeMeasure.fridgeChars}`,
    `words=${fridgeMeasure.fridgeWords}`,
    `blank=${fridgeMeasure.fridgeBlank}`,
    `within_gate=${fridgeMeasure.fridgeWithinGate}`,
    `limit=${GATE_MAX_CHARS}`,
  ].join(SPACE_JOINER);
  return gateReport;
}

function hasFridgeFullStop(fridgeLine: string): boolean {
  const fridgeTail = fridgeLine.slice(-1);
  const fridgeStopped = fridgeTail === FULL_STOP;
  return fridgeStopped;
}

function checkFridgeParts(fridgeParts: readonly string[]): void {
  const partsComplaint = `expected ${FRIDGE_EXPECTED_PARTS} message parts, found ${fridgeParts.length}`;
  if (fridgeParts.length !== FRIDGE_EXPECTED_PARTS) {
    throw new Error(partsComplaint);
  }
  for (const fridgePart of fridgeParts) {
    const partComplaint = "a message part must not be blank";
    if (isFridgeLineBlank(fridgePart)) {
      throw new Error(partComplaint);
    }
  }
}

function buildFridgeLine(): string {
  checkFridgeParts(FRIDGE_PARTS);
  const rawLine = joinFridgeParts(FRIDGE_PARTS);
  const packedLine = collapseFridgeWhitespace(rawLine);
  const fridgeMeasure = measureFridgeLine(packedLine);
  const gateSummary = describeFridgeGate(fridgeMeasure);
  const fridgeComplaint = `gate check failed (${gateSummary})`;
  if (fridgeMeasure.fridgeWithinGate === false) {
    throw new Error(fridgeComplaint);
  }
  const stopComplaint = "line must end with a full stop";
  if (hasFridgeFullStop(packedLine) === false) {
    throw new Error(stopComplaint);
  }
  return packedLine;
}

function resolveFridgeOutputPath(): string {
  const fridgeOutputPath = join(OUTPUT_DIR, OUTPUT_NAME);
  return fridgeOutputPath;
}

function ensureFridgeOutputDir(fridgeOutputPath: string): string {
  const fridgeParent = dirname(fridgeOutputPath);
  mkdirSync(fridgeParent, { recursive: true });
  return fridgeParent;
}

function writeFridgeLine(
  fridgeOutputPath: string,
  fridgeLine: string,
): number {
  writeFileSync(fridgeOutputPath, fridgeLine, { encoding: "utf8" });
  const writtenBytes = Buffer.byteLength(fridgeLine, "utf8");
  return writtenBytes;
}

function readFridgeLineBack(fridgeOutputPath: string): string {
  const fridgeRoundTrip = readFileSync(fridgeOutputPath, {
    encoding: "utf8",
  });
  return fridgeRoundTrip;
}

function confirmFridgeRoundTrip(
  fridgeLine: string,
  fridgeRoundTrip: string,
): boolean {
  const fridgeMatches = fridgeRoundTrip === fridgeLine;
  return fridgeMatches;
}

function auditFridgeBytes(fridgeLine: string): {
  fridgeBytes: number;
  fridgeHasNewline: boolean;
  fridgeHasCarriage: boolean;
  fridgeHasTab: boolean;
} {
  const fridgeBuffer = Buffer.from(fridgeLine, "utf8");
  const fridgeBytes = fridgeBuffer.length;
  const fridgeHasNewline = fridgeBuffer.includes(NEWLINE_CODE);
  const fridgeHasCarriage = fridgeBuffer.includes(CARRIAGE_CODE);
  const fridgeHasTab = fridgeBuffer.includes(TAB_CODE);
  const fridgeAudit = {
    fridgeBytes,
    fridgeHasNewline,
    fridgeHasCarriage,
    fridgeHasTab,
  };
  return fridgeAudit;
}

function auditFridgeLineAgain(fridgeLine: string): string {
  const fridgeMeasure = measureFridgeLine(fridgeLine);
  const fridgeAudit = auditFridgeBytes(fridgeLine);
  const gateSummary = describeFridgeGate(fridgeMeasure);
  const auditFindings: string[] = [];
  if (fridgeMeasure.fridgeWithinGate === false) {
    auditFindings.push(`second-pass gate failed (${gateSummary})`);
  }
  if (fridgeAudit.fridgeHasNewline) {
    auditFindings.push("second-pass found a newline");
  }
  if (fridgeAudit.fridgeHasCarriage) {
    auditFindings.push("second-pass found a carriage return");
  }
  if (fridgeAudit.fridgeHasTab) {
    auditFindings.push("second-pass found a tab");
  }
  if (hasFridgeFullStop(fridgeLine) === false) {
    auditFindings.push("second-pass found no closing full stop");
  }
  const auditVerdict = auditFindings.join("; ");
  return auditVerdict;
}

function printFridgeReport(
  fridgeLine: string,
  fridgeOutputPath: string,
  fridgeBytes: number,
): void {
  const fridgeMeasure = measureFridgeLine(fridgeLine);
  const gateSummary = describeFridgeGate(fridgeMeasure);
  const fridgeReportLines = [
    `fridge3am-entry3: wrote ${fridgeOutputPath}`,
    `line: ${fridgeLine}`,
    `gate: ${gateSummary}`,
    `bytes: ${fridgeBytes}`,
  ];
  for (const fridgeReportLine of fridgeReportLines) {
    console.log(fridgeReportLine);
  }
}

// ---------------------------------------------------------------------
// Entry point. The whole run is one guarded block: compose, validate,
// write, read back, prove with a second audit pass. Any failure
// throws with a named cause and exits nonzero.
// ---------------------------------------------------------------------

function runFridgeEntry(): void {
  try { const fridgeLine = buildFridgeLine();
    const fridgeOutputPath = resolveFridgeOutputPath();
    const fridgeParent = ensureFridgeOutputDir(fridgeOutputPath);
    const fridgeBytes = writeFridgeLine(fridgeOutputPath, fridgeLine);
    const fridgeRoundTrip = readFridgeLineBack(fridgeOutputPath);
    const fridgeMatches = confirmFridgeRoundTrip(fridgeLine, fridgeRoundTrip);
    const fridgeAudit = auditFridgeBytes(fridgeLine);
    const roundTripComplaint = "round-trip mismatch: bytes on disk differ";
    if (fridgeMatches === false) {
      throw new Error(roundTripComplaint);
    }
    const auditComplaint =
      "audit failed: line must be a single line with no newline";
    if (fridgeAudit.fridgeHasNewline) {
      throw new Error(auditComplaint);
    }
    const secondPassVerdict = auditFridgeLineAgain(fridgeRoundTrip);
    if (secondPassVerdict.length > 0) {
      throw new Error(secondPassVerdict);
    }
    printFridgeReport(fridgeLine, fridgeOutputPath, fridgeBytes);
    const fridgeSummary = `done: ${fridgeParent} holds ${OUTPUT_NAME} (${fridgeBytes} bytes)`;
    console.log(fridgeSummary);
  } catch (fridgeFailure) {
    const fridgeCause =
      fridgeFailure instanceof Error
        ? fridgeFailure.message
        : String(fridgeFailure);
    const fridgeFatal = `fridge3am-entry3 failed: ${fridgeCause}`;
    console.error(fridgeFatal);
    process.exitCode = 1;
  }
}

runFridgeEntry();
