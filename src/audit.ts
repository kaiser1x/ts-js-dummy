export interface AuditEntry {
  event: string;
  ref: string;
  at: string;
}

const TRAIL: AuditEntry[] = [];

export function auditLog(event: string, ref: string): AuditEntry {
  const entry: AuditEntry = { event, ref, at: new Date().toISOString() };
  TRAIL.push(entry);
  return entry;
}

export function auditTrail(): AuditEntry[] {
  return [...TRAIL];
}

// --- Settlement pipeline (simplified end-of-day run) ---
// HUBRIS traces GET /start through: begin → alpha → bravo → charlie →
// delta → echo → foxtrot (8 steps, capped).

export function begin(): void {
  console.log("settlement started");
  alpha();
}

function alpha(): void {
  bravo();
}

function bravo(): void {
  charlie();
}

function charlie(): void {
  delta();
  alpha(); // retry guard: cycle, absorbed by the visited set
}

function delta(): void {
  echo();
  zulu();
  void fetch("https://example.com/health"); // external runtime call
}

function echo(): void {
  foxtrot();
}

function foxtrot(): void {
  charlie(); // back edge: cycle, absorbed by the visited set
}

function zulu(): void {
  console.log("zulu branch");
}
