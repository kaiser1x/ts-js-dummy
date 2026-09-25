# ts-js-dummy

A small demo backend for exercising codebase analysis: imports, function
calls, API-style routes, tests, a cycle, and a disconnected module. Built as
an ingestion target for execution-trace and debugging experiments.

## What it does

In-memory users + payments ledger with notifications, an audit trail, and a
simplified end-of-day settlement pipeline. No database, no network services,
no frameworks — everything runs locally with Node 24.

## Install

Requires Node.js 24 and pnpm.

```bash
pnpm install
```

## Test

```bash
pnpm test        # vitest
```

## Typecheck / build / run

```bash
pnpm typecheck   # tsc --noEmit
pnpm build       # tsc → dist/
pnpm start       # node src/index.ts (lists registered routes)
```

## Architecture

```
src/
  index.ts          entry point, prints the route table
  api.ts            tiny router shim + route registrations
  users.ts          user lookup (getUser → findUser)
  payments.ts       payment flow + idempotency guard + ledger
  notifications.ts  notification formatting
  utils.ts          money formatting, positivity check
  audit.ts          audit trail + settlement pipeline (begin → … → foxtrot)
  isolated.ts       disconnected module nothing imports (by design)
tests/
  users.test.ts     lookup behavior
  payments.test.ts  validation, creation, duplicates, notifications
```

## Important execution paths

**Payments:** `POST /payments` → `createPayment` → `getUser` → `findUser`;
then `validatePayment` → `savePayment` → `sendNotification` → `auditLog`.

**Settlement trace:** `GET /start` → `begin` → `alpha` → `bravo` →
`charlie` → `delta` → `echo` → `foxtrot` (8 steps, traversal cap).

## Intentional graph features

- **Function calls:** `createPayment` calls `getUser`, `validatePayment`,
  `savePayment`, `sendNotification`, `auditLog`.
- **Multi-hop:** `createPayment → getUser → findUser`; the 8-step settlement chain.
- **Imports:** `payments → users/notifications/audit/utils`; `api → users/payments/audit`.
- **Entry points:** `GET /users/:id`, `POST /payments`, `GET /start`.
- **Tests reference app code:** `tests/*.test.ts` import from `src/`.
- **External call:** `console.log` in `begin` (filtered, never a trace step);
  `fetch` in `delta` (recorded but unresolvable, skipped during traversal).
- **Cycle:** `charlie → delta … → foxtrot → charlie`, plus a `charlie → alpha`
  retry guard. Absorbed by the visited set; each node appears once.
- **Branch:** `delta` calls `echo` (taken, first-defined) and `zulu`
  (defined but never traversed).
- **Disconnected:** `src/isolated.ts` is never imported.

## Future FORGE demo

`createPayment` currently checks the idempotency key **before** writing the
payment. Moving that guard to **after** `savePayment` introduces a duplicate-
processing regression on concurrent retries — the intended controlled bug for
future patch-generation demonstrations. The repository is healthy as-is.
