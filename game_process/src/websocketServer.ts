import WebSocket, { WebSocketServer } from 'ws';
import { rooms } from './controllers/roomController';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';

export const setupWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

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
          console.log(message.toString('utf8'))
          client.send(message.toString('utf8'));
        }
      });

      if (role === 'user') {
        if (message.toString('utf8') === rooms[roomId].correctAnswer) {
          rooms[roomId].correctAnswer = null;
          rooms[roomId].roundFinish = null;

          [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
            if (client && client !== ws && client.readyState === WebSocket.OPEN) {
              client.send('correct answer weee');
            }
          });
          
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
