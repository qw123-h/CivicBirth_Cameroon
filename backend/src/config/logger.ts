import winston from 'winston';
import { config } from './env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level} ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  levels,
  format,
  transports,
  defaultMeta: { service: 'civicbirth-backend' },
});

export function logError(message: string, error?: Error) {
  logger.error(
    message,
    error ? { stack: error.stack, message: error.message } : {},
  );
}

export function logWarn(message: string, data?: object) {
  logger.warn(message, data);
}

export function logInfo(message: string, data?: object) {
  logger.info(message, data);
}

export function logDebug(message: string, data?: object) {
  logger.debug(message, data);
}
