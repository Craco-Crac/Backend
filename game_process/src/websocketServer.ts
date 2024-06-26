import { WebSocket, WebSocketServer } from 'ws';
import { rooms } from '@/types/roomTypes';
import { Server as HttpServer } from 'http';
import { processMessage } from '@/utils/webSocketMessages';
import { sendToRoom } from '@/utils/roomUtils'
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
      ws.needsSnapshot = true;
      if (rooms[roomId].admins.size)
        rooms[roomId].admins.values().next().value.send(JSON.stringify({ type: 'req-snapshot' }));
      else if (rooms[roomId].users.size)
        rooms[roomId].users.values().next().value.send(JSON.stringify({ type: 'req-snapshot' }));
      else if (rooms[roomId].snapshot) {
        ws.send(rooms[roomId].snapshot as Buffer);
        ws.needsSnapshot = false;
      }
      //else{}
      rooms[roomId].admins.add(ws);
    } else {
      ws.needsSnapshot = true;
      if (rooms[roomId].admins.size)
        rooms[roomId].admins.values().next().value.send(JSON.stringify({ type: 'req-snapshot' }));
      else if (rooms[roomId].users.size)
        rooms[roomId].users.values().next().value.send(JSON.stringify({ type: 'req-snapshot' }));
      else if (rooms[roomId].snapshot) {
        ws.send(rooms[roomId].snapshot as Buffer);
        ws.needsSnapshot = false;
      }

      rooms[roomId].users.add(ws);
    }


    ws.on('message', (message) => {
      if (message.toString().startsWith('{')) {
        processMessage(ws, message.toString(), roomId, role);
      } else if (message instanceof Buffer) {
        sendToRoom(roomId, message, ws, (wsForCheck?: WebSocket) => {
          return wsForCheck?.needsSnapshot ? true : false;
        });
        rooms[roomId].snapshot = message as Buffer;
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
  }, 30 * 1000);

  setInterval(() => {
    for (const [roomId, roomDetails] of Object.entries(rooms)) {
      if (roomDetails.empty) {
        console.log(`Room ${roomId} is deleted due to long emptiness`)
        delete rooms[roomId];
      }
      else {
        rooms[roomId].empty = !roomDetails.admins.size && !roomDetails.users.size;
      }
    }
  }, 180 * 1000);

  // setInterval(() => {
  //   for (const [, roomDetails] of Object.entries(rooms)) {
  //     if (roomDetails.admins.size)
  //       roomDetails.admins.values().next().value.send(JSON.stringify({ type: 'req-snapshot' }));
  //   }
  // }, 5 * 1000);
};
