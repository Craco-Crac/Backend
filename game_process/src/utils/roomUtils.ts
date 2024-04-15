import { rooms } from '@/types/roomTypes';
import { WebSocket } from 'ws';

export const sendToRoom = (roomId: string, message: string, senderWs?: WebSocket) => {
    const room = rooms[roomId];
    if (!room) {
        console.error(`Room ${roomId} does not exist`);
        return;
    }

    [...room.admins, ...room.users].forEach(client => {
        if (client && client.readyState === WebSocket.OPEN && client !== senderWs) {
            client.send(message);
        }
    });

}

export const closeConnectionsInRoom = (roomId: string,
    message: string = 'Closing all connections from room ' + roomId): void | Error => {
    const room = rooms[roomId];
    if (!room) {
        console.log(`Room with ID ${roomId} does not exist.`);
        return new Error('Room does not exist');
    }

    room.admins.forEach(adminWs => {
        if (adminWs.readyState === WebSocket.OPEN) {
            adminWs.close(1000, message);
        }
    });

    room.users.forEach(userWs => {
        if (userWs.readyState === WebSocket.OPEN) {
            userWs.close(1000, message);
        }
    });

    console.log(`All connections in room with ID ${roomId} have been closed.`);
}
