import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run<T = Record<string, unknown>>(): Promise<T>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

export interface AppEnv {
  DB: D1Database;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

type CloudflareContext = {
  env: Partial<AppEnv>;
  ctx: unknown;
};

export async function getCloudflareEnv() {
  try {
    const context = (await getCloudflareContext({ async: true })) as CloudflareContext;
    return context.env;
  } catch {
    return {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    } satisfies Partial<AppEnv>;
  }
}

export async function getD1Database() {
  const env = await getCloudflareEnv();
  if (!env.DB) {
    throw new Error("D1 binding DB is not configured.");
  }

  return env.DB;
}
