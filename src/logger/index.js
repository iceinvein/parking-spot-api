const winston = require('winston');
const config = require('../config');

let logConfiguration;

const { logLevel } = config;
if (process.env.NODE_ENV === 'development') {
  const transports = [new winston.transports.Console()];
  logConfiguration = {
    level: 'debug',
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.colorize({ all: true }),
      winston.format.simple()
    ),
    transports,
  };
} else {
  const transports = [
    new winston.transports.File({
      filename: config.errorLogFile,
      level: 'error',
    }),
    new winston.transports.File({
      filename: config.logFile,
      level: 'info',
    }),
  ];
  logConfiguration = {
    level: logLevel,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.simple()
    ),
    transports,
  };
}

const LoggerInstance = winston.createLogger(logConfiguration);

module.exports = LoggerInstance;
