import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/index.js";

async function startServer(): Promise<void> {
  try {
    await pool.query("SELECT 1");

    console.log("MySQL connection established successfully");

    const server = app.listen(env.PORT, () => {
      console.log(`Adom Shops API running on http://localhost:${env.PORT}`);
    });

    async function shutdown(signal: string): Promise<void> {
      console.log(`${signal} received. Closing server...`);

      server.close(async () => {
        await pool.end();

        console.log("Server and database connections closed");

        process.exit(0);
      });
    }

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Adom Shops API could not start:", error);

    await pool.end();
    process.exit(1);
  }
}

void startServer();
