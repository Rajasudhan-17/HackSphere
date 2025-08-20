import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const hasDatabaseUrl = !!process.env.DATABASE_URL;

export let pool: Pool | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: any;

if (hasDatabaseUrl) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else if (process.env.DISABLE_AUTH === 'true') {
  // Create a proxy that throws on any DB usage, but lets the module load
  db = new Proxy({}, {
    get() {
      throw new Error("DATABASE_URL must be set to use the database");
    }
  });
} else {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}