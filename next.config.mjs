/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ❌ Remove static export — allows dynamic routes to work
  // output: 'export',

  // ✅ Keep image setting so next/image works even on shared hosting
  images: {
    unoptimized: true,
  },

  // ✅ Keep trailing slashes (useful for cPanel routing)
  trailingSlash: true,
};

export default nextConfig;
