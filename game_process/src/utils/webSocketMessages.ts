import { WebSocket } from 'ws';
import { rooms, Message } from '@/types/roomTypes';
import { sendToRoom } from '@/utils/roomUtils';

export const processMessage = function(ws: WebSocket, message: string, roomId: string, role: string): void {
    const objMessage = JSON.parse(message);
    if(objMessage.type === 'snapshot') {
        rooms[roomId].snapshot = objMessage.snapshot;
    }
    else if (objMessage.type === 'pong') {
        ws.isAlive = true;
    } 
    else {
        broadcastToRoom(ws, roomId, message);

        if (role === 'user' && objMessage.type === 'chat' && objMessage.text) {
            checkForCorrectAnswer(objMessage, roomId);
        }
    }
}

function broadcastToRoom(ws: WebSocket, roomId: string, message: string): void {
    [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function checkForCorrectAnswer(message: Message, roomId: string): void {
    if (message.text === rooms[roomId].correctAnswer) {
        sendToRoom(roomId, JSON.stringify({
            type: 'correct',
            correctAnswer: rooms[roomId].correctAnswer,
            winner: message.sender
        }));

        clearTimeout(rooms[roomId].roundFinishTimeout);
        rooms[roomId].correctAnswer = null;
        rooms[roomId].roundFinishtime = null;
    }
}

