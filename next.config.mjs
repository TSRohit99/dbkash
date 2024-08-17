/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        MONGO_URI: process.env.MONGO_URI,
      },
};

export default nextConfig;
