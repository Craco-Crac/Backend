import 'module-alias/register';
import app from '@/app';
import { createServer } from 'http';
import { setupWebSocketServer } from '@/websocketServer';

const server = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

setupWebSocketServer(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game service listening on port ${PORT}`);
});
