import app from './app';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocketServer';

const server = createServer(app);
const PORT = process.env.PORT || 3000;

setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
