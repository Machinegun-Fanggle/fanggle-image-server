import { PinoLoggerOptions } from 'fastify/types/logger';

const pinoEnvLogger: Record<string, boolean | PinoLoggerOptions> = {
  dev: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  prod: true,
};

export default pinoEnvLogger;
