import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";

// Create a fresh app per invocation cold start.
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let handlerPromise: Promise<ReturnType<typeof serverless>> | null = null;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const server = await registerRoutes(app);
      // serverless-http needs the express app, not the Node server
      return serverless(app, { requestId: true });
    })();
  }
  return handlerPromise;
}

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  const handler = await getHandler();
  // @ts-expect-error types mismatch between express and vercel's req/res, serverless-http handles it
  return handler(req, res);
}


