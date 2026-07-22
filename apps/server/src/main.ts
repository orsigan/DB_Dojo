import { createServer } from 'node:http';
import { describeError, handle, sendJson } from './http';

const port = Number(process.env['SERVER_PORT'] ?? 8787);

const server = createServer((request, response) => {
  handle(request, response).catch((cause) => {
    sendJson(response, 500, { message: describeError(cause) });
  });
});

server.listen(port, () => {
  process.stdout.write(`DB Dojo backend listening on http://localhost:${port}\n`);
});
