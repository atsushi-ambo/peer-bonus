/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',
  // For Docker builds, uncomment the following:
  // output: 'standalone',
  // experimental: {
  //   outputFileTracingRoot: path.join(__dirname, '../../')
  // }
};

export default nextConfig;
