import type { NextConfig } from "next";

function supabaseHostname(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME) {
    return process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME;
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }

  return "xxxx.supabase.co";
}

function apiOrigin(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  return new URL(apiBase).origin;
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://checkout.razorpay.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src 'self' ${apiOrigin()} https://*.supabase.co https://api.razorpay.com`,
      "frame-src 'self' https://api.razorpay.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1", "172.28.104.24"],
  turbopack: {
    root: ".",
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: supabaseHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
