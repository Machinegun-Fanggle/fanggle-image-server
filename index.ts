import Fastify from 'fastify';
import fs from 'node:fs/promises';
import normalFs from 'node:fs';
import { createLogger } from './src/service/logger';
import { S3Client } from "@aws-sdk/client-s3";
import multer from 'fastify-multer';
import multerS3 from 'multer-s3';
import { config } from 'dotenv';

config();

const runLogger = createLogger('application-runner');

const server = Fastify();

server.register(multer.contentParser);

const s3 = new S3Client();

const uploader = multer({
  storage: multerS3({
    s3,
    bucket: 'machinegunsoft',
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
}, async (req, res) => {
  return res.status(200).send();
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
