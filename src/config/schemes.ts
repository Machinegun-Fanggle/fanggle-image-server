import { FastifySchema } from "fastify";
import httpStatus from "http-status";

const schemes: Record<string, FastifySchema> = {
  singleUploadApi: {
    consumes: ['multipart/form-data'],
    description: '단일 파일 업로드를 수행합니다.',
    summary: '단일 파일 업로드 API',
    response: {
      [httpStatus.CREATED]: {
        description: '파일 업로드 성공',
        type: 'object',
        properties: {
          url: { type: 'string' }
        }
      }
    }
  }
};

export default schemes;
