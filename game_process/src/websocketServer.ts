import WebSocket, { WebSocketServer } from 'ws';
import { rooms } from './controllers/roomController';
import { Server as HttpServer } from 'http';

export const setupWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const roomId = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('roomId');
    const role = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('role');

    if (!roomId || !rooms[roomId] || (role !== 'admin' && role !== 'user')) {
      ws.close(1000, 'Invalid request');
      return;
    }

    if (role === 'admin') {
      if (rooms[roomId].admin) {
        ws.close(1000, 'Room already has an admin');
        return;
      }
      rooms[roomId].admin = ws;
    } else {
      rooms[roomId].users.add(ws);
    }

    ws.on('message', (message) => {
      [rooms[roomId].admin, ...rooms[roomId].users].forEach(client => {
        if (client && client !== ws && client.readyState === WebSocket.OPEN) {
          console.log(message.toString('utf8'))
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      if (role === 'admin') {
        rooms[roomId].admin = null;
      } else {
        rooms[roomId].users.delete(ws);
      }
    });
  });
};
