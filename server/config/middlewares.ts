export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  // Add OAuth redirect middleware before security
  'global::oauth-redirect',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": [
            "'self'",
            "https:",
            // OAuth providers
            "https://accounts.google.com",
            "https://www.googleapis.com",
            "https://api.linkedin.com",
            "https://www.linkedin.com",
          ],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "shuru-bkt.s3.eu-west-3.amazonaws.com", // change here
            // OAuth providers for profile images
            "https://lh3.googleusercontent.com",
            "https://media.licdn.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "shuru-bkt.s3.eu-west-3.amazonaws.com", // change here
          ],
          "frame-src": [
            "https://www.shuru.sa/",
            // OAuth providers
            "https://accounts.google.com",
            "https://www.linkedin.com",
          ],
          "form-action": [
            "'self'",
            // OAuth providers
            "https://accounts.google.com",
            "https://www.linkedin.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'https://www.shuru.sa',
        'https://shuru.sa',
        'http://localhost:1337', // for development
        // OAuth provider origins
        'https://accounts.google.com',
        'https://www.linkedin.com',
        'https://linkedin.com',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
      keepHeaderOnError: true,
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      key: 'koa.sess', // session cookie name
      maxAge: 86400000, // 24 hours in ms
      autoCommit: true,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
      renew: false,
      secure: false, // Explicitly disable secure cookies for all environments initially
      sameSite: 'lax', // More permissive for development
    },
  },
  'strapi::favicon',
  'strapi::public',
];
