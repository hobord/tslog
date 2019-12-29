import { createLogger, format, Logger as WLogger, LoggerOptions, transports } from 'winston';
import { Format, TransformableInfo } from 'logform';
import * as os from 'os';

const { printf } = format;

interface IEventHeader {
    eventDateTime: string;
    target: string;
    level?: string;
    environment?: string;
}

interface ILogEvent {
    eventHeader: IEventHeader;
    eventData: {
        message: string;
        [key: string]: any;
    };
}

const makeFormatLogger: (nodeEnv: string, elkIndex: string) => Format = (nodeEnv, elkIndex) => printf((info: TransformableInfo) => {
    const {level, message, ...meta} = info;
    const json: ILogEvent = {
        eventHeader: {
            eventDateTime: new Date().toISOString(),
            level,
            environment: nodeEnv,
            target: elkIndex,
        },
        eventData: {
            message,
            ...meta
        },
    };
    return JSON.stringify(json);
});

export class Logger<T> {
    private static elkIndex: string;
    private static nodeEnv: string;
    private static logLevel: string;
    private _logger: WLogger;

    private constructor(options: LoggerOptions) {
        this._logger = createLogger(options);
    }

    static setElkIndex(value: string): void {
        Logger.elkIndex = value;
    }

    static setNodeEnv(value: string): void {
        Logger.nodeEnv = value;
    }

    static setLogLevel(value: string): void {
        Logger.logLevel = value;
    }

    static createConsoleLogger<T>(nodeEnv: string = Logger.nodeEnv, elkIndex: string = Logger.elkIndex, logLevel: string = Logger.logLevel) {
        if (!nodeEnv) {
            throw new Error('Node env not passed or set');
        }
        if (!elkIndex) {
            throw new Error('Elk index not passed or set');
        }
        if (!logLevel) {
            throw new Error('Log level not passed or set');
        }
        return new Logger<T>({
            level: logLevel,
            transports: [new transports.Console({
                format: makeFormatLogger(nodeEnv, elkIndex)
            })],
        });
    }

    static createFileLogger<T>(dirname: string, nodeEnv: string = Logger.nodeEnv, elkIndex: string = Logger.elkIndex, logLevel: string = Logger.logLevel) {
        if (!nodeEnv) {
            throw new Error('Node env not passed or set');
        }
        if (!elkIndex) {
            throw new Error('Elk index not passed or set');
        }
        if (!logLevel) {
            throw new Error('Log level not passed or set');
        }
        return new Logger<T>({
            level: logLevel,
            transports: [
                new transports.Console({
                    level: logLevel === 'development' ? 'debug' : 'info',
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
                    dirname,
                    filename: `application_${os.hostname()}.log`,
                    maxsize: 1024 * 1024 * 5,
                    maxFiles: 2,
                    tailable: true,
                    handleExceptions: true,
                    format: makeFormatLogger(nodeEnv, elkIndex)
                })
            ],
        });
    }

    public error(message: string, data: T): void {
        this._logger.error(message, data);
    }

    public info(message: string, data: T): void {
        this._logger.info(message, data);
    }

    public debug(message: string, data: T): void {
        this._logger.debug(message, data);
    }

    public warn(message: string, data: T): void {
        this._logger.warn(message, data);
    }
}
