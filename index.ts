import Fastify from 'fastify';

const server = Fastify({
  logger: true,
});


server.listen({ path: 'localhost', port: 8880 }, (err, address) => {
  console.log(`Server Runned On ${address}`);
  if (err) {
    console.error(err);
    process.exit();
  }
});
