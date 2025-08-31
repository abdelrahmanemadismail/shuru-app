export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Add absolute URL for OAuth providers
  url: env('SERVER_URL', 'https://cms.shuru.sa'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Add request timeout and size limits
  request: {
    timeout: 60000, // 60 seconds
    maxBodySize: '50mb', // Increase if you need larger uploads
  },
  // Add HTTP server timeout
  httpTimeout: 60000,
});
