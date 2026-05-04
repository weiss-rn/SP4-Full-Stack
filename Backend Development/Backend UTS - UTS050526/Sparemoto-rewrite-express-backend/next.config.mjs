import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Next 16+ defaults to Turbopack for builds. In this environment there's a
  // separate lockfile in `C:\\Users\\darma` which can confuse root inference.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

