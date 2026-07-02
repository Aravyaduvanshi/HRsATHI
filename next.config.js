const nextConfig = {
  experimental: {
    // Server Actions are stable in Next 14 — no flag needed
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Prevent the BullMQ / ioredis Node modules from being bundled by webpack
  // when imported inside Route Handlers (they are server-only)
  serverExternalPackages: ["bullmq", "ioredis"],
};

module.exports = nextConfig;
