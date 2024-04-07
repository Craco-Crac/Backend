import WebSocket, { WebSocketServer } from 'ws';
import { rooms } from './controllers/roomController';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import { sendToRoom } from './utils/sendToRooms';

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

  wss.on('connection', (ws, req) => {

    const cookies = cookie.parse(req.headers.cookie || '');
    const roomId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('roomId');
    const role = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('role');

    if (!roomId || !rooms[roomId] || (role !== 'admin' && role !== 'user')) {
      ws.close(1000, 'Invalid request');
      return;
    }

    if (role === 'admin') {
      if (rooms[roomId].admins.size >= rooms[roomId].maxAdmins) {
        ws.close(1000, 'Room already has the maximum number of admins.');
        return;
      }
      rooms[roomId].admins.add(ws);
    } else {
      rooms[roomId].users.add(ws);
    }

    ws.on('message', (message) => {
      console.log(cookies);

      [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
        if (client && client !== ws && client.readyState === WebSocket.OPEN) {
          console.log(message.toString('utf8'));
          client.send(message.toString('utf8')); //{type: 'chat', text: message.toString('utf8')}
        }
      });

      if (role === 'user') {
        if (message.toString('utf8') === rooms[roomId].correctAnswer) {
          rooms[roomId].correctAnswer = null;
          rooms[roomId].roundFinish = null;

          sendToRoom(roomId, JSON.stringify({
            type: 'correct',
            correctAnswer: rooms[roomId].correctAnswer, winner: "fake" //change later
          }));
        }
      }
    });

    ws.on('close', () => {
      if (role === 'admin') {
        rooms[roomId].admins.delete(ws);
      } else {
        rooms[roomId].users.delete(ws);
      }
    });
  });
};
