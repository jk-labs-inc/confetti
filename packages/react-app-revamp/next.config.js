/** @type {import('next').NextConfig} */

const path = require("path");
const withPWA = require("next-pwa");
const webpack = require("webpack");

const nextConfig = {
  reactStrictMode: false,
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.modules = [path.resolve(__dirname, "node_modules"), ...(config.resolve.modules || ["node_modules"])];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // ignore optional wagmi connectors and para providers to suppress build warnings
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@metamask\/(sdk|connect-evm)|@safe-global\/safe-apps-(sdk|provider)|@gemini-wallet\/core|@base-org\/account|@getpara\/aa-(alchemy|biconomy|cdp|gelato|pimlico|porto|rhinestone|safe|thirdweb|zerodev))$/,
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
