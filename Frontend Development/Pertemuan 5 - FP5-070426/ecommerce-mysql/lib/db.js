import mysql from "mysql2/promise";

let connection = null;

export async function connect() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return connection;
}

export const db = {
  execute: async (sql, values = []) => {
    const conn = await connect();
    return conn.execute(sql, values);
  },
};