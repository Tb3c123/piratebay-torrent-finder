/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                pathname: '/images/**',
            },
            {
                protocol: 'http',
                hostname: 'm.media-amazon.com',
                pathname: '/images/**',
            },
        ],
    },
}

module.exports = nextConfig
