export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blitz',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'blitz_admin',
    password: process.env.ADMIN_PASSWORD || 'change-me-in-production',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5500')
      .split(',')
      .map((o) => o.trim()),
  },
  uploads: {
    dir: process.env.UPLOADS_DIR || 'uploads',
  },
});
