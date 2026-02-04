/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa");
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: false,
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // this config is if we want to ignore wagmi connectors to suppress build warnings, we can safely ignore this since we are using Para SDK for wallet stuff
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@metamask\/sdk|@safe-global\/safe-apps-sdk|@safe-global\/safe-apps-provider|@gemini-wallet\/core|@base-org\/account)$/,
      }),
    );

    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.confetti.win",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ["react-tweet"],
  output: "standalone",
};

module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 5mb
})(nextConfig);
