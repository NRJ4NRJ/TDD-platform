import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tdd-platform.vercel.app";
const siteHost = siteUrl.replace(/^https?:\/\//, "");

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: ["localhost:3000", siteHost],
  },
};

export default nextConfig;
