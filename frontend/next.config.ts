import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'owen.cdn.vccloud.vn' },
            { protocol: 'https', hostname: 'sixdo.vn' },
            { protocol: 'https', hostname: 'leika.vn' },
            { protocol: 'https', hostname: 'image.uniqlo.com' },
            { protocol: 'https', hostname: 'assets.adidas.com' },
            { protocol: 'https', hostname: 'localhost' },
        ],
    },
};

export default nextConfig;