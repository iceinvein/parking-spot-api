module.exports = {
  port: process.env.PORT,
  mongodbUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRE,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRE,
  corsOptions: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  logLevel: process.env.LOG_LEVEL,
  logFile: process.env.LOG_FILE,
  errorLogFile: process.env.ERROR_LOG_FILE,
};
