import {createLogger, format, transports } from 'winston';
import { LoggerInterface } from './logger.interface';
import * as os from 'os';
import { getOsEnv } from '../env';
import winston = require('winston');

const NODE_ENV = getOsEnv('NODE_ENV', 'development');

const MESSAGE = Symbol.for('message');

const jsonFormatter = (logEntry) => {
  const { level, message, ...meta } = logEntry;
  const eventData = {
    message: logEntry.message,
    ...meta
  };

  const json = {
    eventHeader: {
      eventDateTime: new Date(),
      level: logEntry.level,
      environment: NODE_ENV,
      target: getOsEnv('LOG_INDEX', 'UPPER_FUNNEL_FBCA_CONSUMER'),
    },
    eventData
  };

  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};


export const logger = <LoggerInterface>createLogger({
  level: getOsEnv('LOG_LEVEL', 'info'),
  transports: [
    new transports.Console({
      level: NODE_ENV === 'development' ? 'debug' : 'info',
      handleExceptions: true,
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
    new transports.File({
      dirname: getOsEnv('LOG_DIR', 'logs/'),
      filename: `application_${os.hostname()}.log`,
      maxsize: 1024 * 1024 * 5,
      maxFiles: 2,
      tailable: true,
      handleExceptions: true,
      format: winston.format(jsonFormatter)()
    })
  ],
  exitOnError: true,
});
