import { listRoutes } from "./api.js";

function main(): void {
  for (const route of listRoutes()) {
    console.log(`${route.method} ${route.path}`);
  }
}

main();
