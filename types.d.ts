import { File } from 'fastify-multer/lib/interfaces';

type ApplicationFile  = File & { location: string };

declare module 'fastify' {
  interface FastifyRequest {
    file: ApplicationFile;
    files: ApplicationFile[];
  }
}
