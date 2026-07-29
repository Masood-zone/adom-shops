import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

import { env } from "../config/env.js";

const mysqlPool = mysql.createPool(env.DATABASE_URL);

export const pool = mysqlPool.promise();

export const db = drizzle({
  client: mysqlPool,
});
