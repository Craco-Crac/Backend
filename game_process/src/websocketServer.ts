import { WebSocket, WebSocketServer } from 'ws';
import { rooms } from './controllers/roomController';
import { Server as HttpServer } from 'http';
import { sendToRoom } from './utils/roomUtils';


export const setupWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({
    server,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib documentation for options
        chunkSize: 1024,
        memLevel: 7,
        level: 3, // Compression level
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Optional
      // Below two options limit concurrent compression tasks to avoid a DoS attack.
      concurrencyLimit: 10, // Limits zlib concurrency for performance.
      threshold: 1024, // Size (in bytes) below which messages should not be compressed.
    }
  });

  wss.on('connection', (ws: WebSocket, req) => {
    ws.isAlive = true;
    const roomId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('roomId');
    const role = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('role');

    if (!roomId || !rooms[roomId] || (role !== 'admin' && role !== 'user')) {
      ws.close(4001, 'Invalid roomId or role');
      return;
    }

    if (role === 'admin') {
      if (rooms[roomId].admins.size >= rooms[roomId].maxAdmins) {
        ws.close(4002, 'Room already has the maximum number of admins.');
        return;
      }
      rooms[roomId].admins.add(ws);
    } else {
      rooms[roomId].users.add(ws);
    }

    ws.on('message', (message) => {
      const objMessage = JSON.parse(message.toString('utf8'));
      if (objMessage.type === 'pong') {
        ws.isAlive = true;
      }
      else {
        [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
          if (client && client !== ws && client.readyState === WebSocket.OPEN) {
            console.log(message.toString('utf8'));
            client.send(message.toString('utf8')); //{type: 'chat', text: message}
          }
        });

        if (role === 'user' && objMessage.type === 'chat') {
          if (objMessage.text === rooms[roomId].correctAnswer) {

            sendToRoom(roomId, JSON.stringify({
              type: 'correct',
              correctAnswer: rooms[roomId].correctAnswer,
              winner: objMessage.sender
            }));

            rooms[roomId].correctAnswer = null;
            rooms[roomId].roundFinishtime = null;
          }
        }
      }
    });

    ws.on('close', () => {
      if (role === 'admin') {
        rooms[roomId]?.admins.has(ws) ? rooms[roomId].admins.delete(ws) : null;
      } else {
        rooms[roomId]?.users.has(ws) ? rooms[roomId].users.delete(ws) : null;
      }
    });
  });

  setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.send(JSON.stringify({ type: 'ping' }));
    });
  }, 30000);
};
