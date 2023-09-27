import winston, { Logger, LoggerOptions } from 'winston';
import path from 'node:path';
import { getNodeEnv, NodeEnvVariables } from "../config/variables";

type ExtendedLoggerOptions = LoggerOptions & {
  writeFile?: boolean;
};

/**
 * @description Logger 객체를 생성합니다.
 */
export const createLogger = (name: string, option?: ExtendedLoggerOptions): Logger => winston.createLogger({
  defaultMeta: { name },
  exitOnError: false,
  transports: [
    new winston.transports.Console(),
    // option?.writeFile && new winston.transports.File({
    //   dirname: path.resolve(__dirname, 'logs'),
    //   filename: getNodeEnv() === NodeEnvVariables.DEV ? 'application.log' : 'error.log',
    // }),
  ],
  ...option,
});
