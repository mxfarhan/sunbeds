import type { NextConfig } from "next";
import os from "os";

const laravelDevUrl = process.env.LARAVEL_DEV_URL ?? "http://127.0.0.1:8000";

function lanIpv4Hosts(): string[] {
  const hosts = new Set<string>();
  try {
    const urlHost = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "").hostname;
    if (urlHost) hosts.add(urlHost);
  } catch {
    // ignore invalid WEB_URL
  }
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        hosts.add(net.address);
      }
    }
  }
  return [...hosts];
}

const lanHosts = lanIpv4Hosts();
const devHosts = ["127.0.0.1", "localhost", ...lanHosts];

// Laravel may emit storage URLs on either its own port or the Next.js proxy port.
const storagePatterns = devHosts.flatMap((hostname) =>
  ["3000", "8000"].map((port) => ({
    protocol: "http" as const,
    hostname,
    port,
    pathname: "/storage/**",
  }))
);

const nextConfig: NextConfig = {
  // Standalone is for Hostinger/PM2 self-host. Vercel must NOT use it (breaks NFT tracing).
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  reactCompiler: false,
  // Required for iPhone / LAN access during local dev (Next.js 16 blocks HMR otherwise)
  allowedDevOrigins: devHosts,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dev-estay.thewrteam.in",
      },
      {
        protocol: "https",
        hostname: "sun.genlenz.com",
      },
      {
        protocol: "https",
        hostname: "beds.genlenz.com",
      },
      ...storagePatterns,
    ],
  },
  async rewrites() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        destination: "/api/sw",
      },
      // Proxy Laravel API + storage through Next.js so phones only need port 3000
      {
        source: "/laravel-api/:path*",
        destination: `${laravelDevUrl}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${laravelDevUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
