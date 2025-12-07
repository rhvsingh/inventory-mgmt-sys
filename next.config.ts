import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        useCache: true,
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },
}

export default nextConfig
