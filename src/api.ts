import * as users from "./users.js";
import { createPayment } from "./payments.js";
import { begin } from "./audit.js";

type Handler = (...args: any[]) => unknown;

export interface Route {
  method: "GET" | "POST";
  path: string;
  handler: Handler;
}

class Router {
  private routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.routes.push({ method: "GET", path, handler });
  }

  post(path: string, handler: Handler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  list(): Route[] {
    return [...this.routes];
  }
}

export const router = new Router();

router.get("/users/:id", users.getUser);
router.post("/payments", createPayment);
router.get("/start", begin);

export function listRoutes(): Route[] {
  return router.list();
}
