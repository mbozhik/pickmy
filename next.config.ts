import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
    browserDebugInfoInTerminal: true,
  },
  images: {
    qualities: [70, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moonlit-gull-567.convex.cloud',
      },
    ],
  },
}

export default nextConfig
