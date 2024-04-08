import { rooms } from '../controllers/roomController';
import { WebSocket } from 'ws';

export const sendToRoom = (roomId: string, message: string) => {
    const room = rooms[roomId];
    if (!room) {
        console.error(`Room ${roomId} does not exist`);
        return;
    }

    // Send message to all admins
    [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

}