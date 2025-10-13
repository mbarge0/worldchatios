/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    reactStrictMode: true,
    poweredByHeader: false,
    trailingSlash: false,
};

module.exports = nextConfig;