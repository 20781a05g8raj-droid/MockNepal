/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db"],
    "/api/*": ["./prisma/dev.db"],
  },
};

export default nextConfig;
