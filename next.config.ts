import type { NextConfig } from "next";

// Static site for GitHub Pages. NEXT_PUBLIC_BASE_PATH is "/growth" on GitHub, empty locally.
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const config: NextConfig = {
  output: "export",
  basePath: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
