/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static page generation
  output: 'standalone',
  
  // Environment variables that should be available to the client
  env: {
    NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    NEXT_PUBLIC_AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    NEXT_PUBLIC_REDIRECT_URI: process.env.REDIRECT_URI,
  },
  
  // Configure webpack for SQL Server native modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'mssql': false,
        'tedious': false,
      };
    }

    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
  
  // API route configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

  // Redirects for authentication
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
