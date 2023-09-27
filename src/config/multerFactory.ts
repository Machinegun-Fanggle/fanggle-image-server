import { config } from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import multer from 'fastify-multer';
config();

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_REGION;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export default function multerFactory() {
  return multer({
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
}
