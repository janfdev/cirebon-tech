import type { NextConfig } from "next";
import { hostname } from "os";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

export default withPWA({
  dest: 'public',
  disable: isDev,
  // disable: false,
})(nextConfig)

// export default nextConfig;
