import winston from 'winston';
import { env } from '../../config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.nodeEnv === 'development' ? combine(colorize(), myFormat) : json()
  ),
  transports: [
    new winston.transports.Console(),
    // We can add File transports here if needed for ERP audit trails
  ],
});

export { logger };
export default logger;
