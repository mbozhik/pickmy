import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moonlit-gull-567.convex.cloud',
      },
    ],
  },
}

export default nextConfig
