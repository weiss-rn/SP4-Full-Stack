import express from "express";
import next from "next";

import { createApiRouter } from "./src/server/api.ts";

const dev = !process.argv.includes("--production");
const host = process.env.HOST ?? "0.0.0.0";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

async function main() {
  const nextApp = next({ dev, hostname: host, port });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const server = express();
  server.disable("x-powered-by");

  server.use("/api", createApiRouter());

  server.use((error: unknown, request: express.Request, response: express.Response, nextMiddleware: express.NextFunction) => {
    if (!request.path.startsWith("/api")) {
      return nextMiddleware(error);
    }

    const message = error instanceof SyntaxError ? "Invalid JSON body." : "Internal server error.";
    const status = error instanceof SyntaxError ? 400 : 500;
    return response.status(status).json({ error: message });
  });

  server.use((request, response) => handle(request, response));

  server.listen(port, host, () => {
    const mode = dev ? "development" : "production";
    console.log(`Sparemoto Express server listening on http://${host}:${port} (${mode})`);
  });
}

main().catch((error) => {
  console.error("Unable to start Express server.", error);
  process.exit(1);
});
