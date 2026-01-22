const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increases the limit from 1MB to 5MB
    },
  },
};

export default nextConfig;