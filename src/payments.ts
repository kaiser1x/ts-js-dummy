import { randomUUID } from "node:crypto";
import { getUser } from "./users.js";
import { sendNotification } from "./notifications.js";
import { auditLog } from "./audit.js";
import { formatMoney, isPositive } from "./utils.js";

export interface Payment {
  id: string;
  userId: string;
  amountCents: number;
  status: "pending" | "completed";
}

const LEDGER: Payment[] = [];
const seenIdempotencyKeys = new Set<string>();

export function validatePayment(amountCents: number): void {
  if (!isPositive(amountCents)) {
    throw new Error(`invalid amount: ${amountCents}`);
  }
}

export function savePayment(userId: string, amountCents: number): Payment {
  const payment: Payment = {
    id: randomUUID(),
    userId,
    amountCents,
    status: "completed",
  };
  LEDGER.push(payment);
  return payment;
}

export function ledger(): Payment[] {
  return [...LEDGER];
}

// Healthy v1: the idempotency guard runs BEFORE the write. A future
// controlled regression may move it after savePayment to demo FORGE.
export function createPayment(
  userId: string,
  amountCents: number,
  idempotencyKey?: string
): { payment: Payment; notice: string } {
  const user = getUser(userId);
  validatePayment(amountCents);
  if (idempotencyKey !== undefined) {
    if (seenIdempotencyKeys.has(idempotencyKey)) {
      throw new Error(`duplicate payment for key ${idempotencyKey}`);
    }
    seenIdempotencyKeys.add(idempotencyKey);
  }
  const payment = savePayment(user.id, amountCents);
  const notice = sendNotification(user, `charged ${formatMoney(amountCents)}`);
  auditLog("payment.created", payment.id);
  return { payment, notice };
}
