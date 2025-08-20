import type { Express, RequestHandler } from "express";

// Lightweight auth shim to run on Vercel. When DISABLE_AUTH=true, all
// auth becomes a no-op. Otherwise, we lazily load the Replit auth module.

export async function setupAuth(app: Express) {
  if (process.env.DISABLE_AUTH === "true") {
    // Polyfill isAuthenticated and a demo user so routes don't crash
    app.use((req, _res, next) => {
      // @ts-expect-error augment
      req.isAuthenticated = () => true;
      // @ts-expect-error augment
      if (!req.user) {
        // minimal shape used in routes
        // not persisted; storage lookups may still return undefined
        // which will enforce 403s for privileged operations
        req.user = {
          claims: { sub: "demo-user" },
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        } as any;
      }
      next();
    });
    return;
  }

  const mod = await import("./replitAuth");
  return mod.setupAuth(app);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (process.env.DISABLE_AUTH === "true") {
    return next();
  }

  const mod = await import("./replitAuth");
  return mod.isAuthenticated(req, res, next);
};


