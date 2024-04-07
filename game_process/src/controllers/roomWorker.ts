import { workerData } from 'worker_threads';
import express, {Request, Response} from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

let viewers: Response[] = [];

server.on('upgrade', (request, socket, head) => {
  if (request.url === `/admin/${workerData.roomId}`) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('Admin connected');
      
      ws.on('message', (message: string) => {
        viewers.forEach((res) => {
          res.write(`data: ${message}\n\n`);
        });
      });

      ws.on('close', () => {
        console.log('Admin disconnected');
      });
    });
  }
});

app.get(`/room/${workerData.roomId}`, (req: Request, res: Response) => {
  req.socket.setTimeout(0);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  viewers.push(res);

  req.on('close', () => {
    console.log('Viewer disconnected');
    viewers = viewers.filter((v) => v !== res);
  });
});

const PORT = workerData.port || 3000;
server.listen(PORT, () => {
  console.log(`Worker for room ${workerData.roomId} started on port ${PORT}`);
});
