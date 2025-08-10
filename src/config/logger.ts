import winston from 'winston';
import { TransformableInfo } from 'logform';
import config from '../config/env.config';


// Define log format
const logFormat = winston.format.printf((info: TransformableInfo) => {
    return `${info.timestamp} [${info.level}] ${info.message} ${
      info.stack ? `\n${info.stack}` : ''
    }`;
  });
  
  // Create logger instance
  const logger = winston.createLogger({
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      logFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({ 
        filename: 'logs/exceptions.log' 
      })
    ]
  });
  
  // Handle uncaught promise rejections
  process.on('unhandledRejection', (ex) => {
    logger.error('UNHANDLED REJECTION:', ex);
  });
  
  export default logger;