import Fastify from 'fastify';
import fs from 'node:fs/promises';
import normalFs from 'node:fs';

const server = Fastify({
  logger: true,
});

(async () => {
  const exists = await new Promise(resolve =>
    normalFs.access('./log', err => {
      if (err) return resolve(false);
      return resolve(true);
    }));

  if (!exists) await fs.mkdir('./log');
})();

server.listen({ path: 'localhost', port: 8880 }, (err, address) => {
  console.log(`Server Runned On ${address}`);
  if (err) {
    console.error(err);
    process.exit();
  }
});
