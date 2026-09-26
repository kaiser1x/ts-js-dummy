import { describe, it, expect } from "vitest";
import { createPayment } from "../src/payments.js";

// Controlled regression test for the hubris/buggy-idempotency fixture.
// Behavioral contract: the second call with an already-seen key must throw
// "Duplicate idempotency key". Currently FAILS (bug: keys are recorded but
// never checked). Must PASS after the Forge fix.
describe("idempotency regression (buggy fixture)", () => {
  it("rejects a previously seen idempotency key", () => {
    createPayment("u-1", 100, "regression-k1");
    // Case-insensitive: any duplicate rejection satisfies the contract,
    // whether the fix restores the original message or words a new one.
    expect(() => createPayment("u-1", 100, "regression-k1")).toThrow(/duplicate/i);
  });
});
