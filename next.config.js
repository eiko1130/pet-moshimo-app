/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  generateBuildId: async () => {
    return Date.now().toString()
  },
}

module.exports = nextConfig