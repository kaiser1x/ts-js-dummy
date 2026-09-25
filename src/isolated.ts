// Deliberately disconnected: nothing imports this module.
// HUBRIS should never wander here from the main execution paths.
export function isolatedHelper(x: number): number {
  return x * 2;
}

export function anotherLonelyFunction(): string {
  return "alone";
}
