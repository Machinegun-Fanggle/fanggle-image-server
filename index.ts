import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fs from 'node:fs/promises';
import normalFs from 'node:fs';
import fastJson from 'fast-json-stringify';
import multer from 'fastify-multer';
import httpStatus from 'http-status';
import { config } from 'dotenv';
config();

import multerFactory from './src/config/multerFactory';
import { createLogger } from './src/service/logger';
import pinoEnvLogger from "./src/config/pinoEnvLogger";
import schemes from "./src/config/schemes";

(async () => {
  const exists = await new Promise(resolve =>
    normalFs.access('./log', err => {
      if (err) return resolve(false);
      return resolve(true);
    }));

  if (!exists) await fs.mkdir('./log');
})();

const runLogger = createLogger('application-runner');
const uploader = multerFactory();

const server = Fastify({
  logger: pinoEnvLogger[process.env.NODE_ENV],
});

server.register(multer.contentParser);
server.register(swagger, {
  swagger: {
    info: {
      title: 'Fanggle 이미지 서버',
      description: 'Fanggle 애플리케이션으로부터 전달된 이미지 업로드를 처리하는 서버입니다.',
      version: '0.0.1',
    },
    consumes: ['application/json'],
    produces: ['application/json', 'multipart/form-data'],
  }
});
server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
  },
  staticCSP: true,
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    }
  },
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject
  },
  transformSpecificationClone: true,
});

server.post('/upload', {
  preHandler: uploader.single('file'),
  schema: schemes.singleUploadApi,
}, async (req, res) => {
  const fileDetails = (req as any).file as File & { location: string };
  return res
    .status(httpStatus.CREATED)
    .send(JSON.stringify(fileDetails));
});

async function bootstrap() {
  await server.ready();
  server.swagger();
  server.listen({ path: 'localhost', port: 8880 }, (err, address) => {
    runLogger.info(`Server Runned On ${address}`);
    if (err) {
      runLogger.error(`error when running application`);
      runLogger.error(`error name is ${err.name}`);
      runLogger.error(err.message);
      process.exit();
    }
  });

}


bootstrap();