import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fs from 'node:fs/promises';
import normalFs from 'node:fs';
import { createLogger } from './src/service/logger';
import { S3Client } from "@aws-sdk/client-s3";
import multer from 'fastify-multer';
import type { Multer} from 'multer';
import multerS3 from 'multer-s3';
import { config } from 'dotenv';

config();

const runLogger = createLogger('application-runner');

const server = Fastify({
  logger: {
    level: 'debug',
    enabled: true,
  },
});

server.register(multer.contentParser);
server.register(swagger);
server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
  },
  staticCSP: true,
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  transformSpecificationClone: true
})

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
console.log({ accessKeyId, secretAccessKey });
const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const uploader = multer({
  storage: multerS3({
    s3,
    bucket: 'machinegunsoft',
    acl: 'public-read-write',
    key: (req, file, cb) => {
      cb(null, file.originalname + new Date().toISOString());
    },
  }) as any,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

(async () => {
  const exists = await new Promise(resolve =>
    normalFs.access('./log', err => {
      if (err) return resolve(false);
      return resolve(true);
    }));

  if (!exists) await fs.mkdir('./log');
})();

server.post('/upload', {
  preHandler: uploader.single('file'),
  schema: {
    consumes: ['multipart/form-data'],
    description: '단일 파일 업로드를 수행합니다.',
    summary: '단일 파일 업로드 API',
    response: {
      201: {
        description: '파일 업로드 성공',
        type: 'object',
        properties: {
          url: { type: 'string' }
        }
      }
    }
  }
}, async (req, res) => {
  const file = (req as any).file as File & { location: string };

  return res
    .status(201)
    .serialize({ url: file.location });
});

server.listen({ path: 'localhost', port: 8880 }, (err, address) => {
  runLogger.info(`Server Runned On ${address}`);
  if (err) {
    runLogger.error(`error when running application`);
    runLogger.error(`error name is ${err.name}`);
    runLogger.error(err.message);
    process.exit();
  }
});
