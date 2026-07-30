import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

import { env } from "../config/env.js";

const mysqlPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

export const pool = mysqlPool.promise();

export const db = drizzle({
  client: mysqlPool,
});
