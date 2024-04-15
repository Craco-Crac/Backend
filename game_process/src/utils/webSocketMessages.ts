import { WebSocket } from 'ws';
import { rooms, Message } from '@/types/roomTypes';
import { sendToRoom } from '@/utils/roomUtils';

export const processMessage = function(ws: WebSocket, message: string, roomId: string, role: string): void {
    const objMessage = JSON.parse(message);

    if (objMessage.type === 'pong') {
        ws.isAlive = true;
    } else {
        broadcastToRoom(ws, roomId, message);

        if (role === 'user' && objMessage.type === 'chat' && objMessage.text) {
            checkForCorrectAnswer(objMessage, roomId, ws);
        }
    }
}

function broadcastToRoom(ws: WebSocket, roomId: string, message: string): void {
    [...rooms[roomId].admins, ...rooms[roomId].users].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            console.log(message);
            client.send(message);
        }
    });
}

function checkForCorrectAnswer(message: Message, roomId: string, senderWs?: WebSocket): void {
    if (message.text === rooms[roomId].correctAnswer) {
        sendToRoom(roomId, JSON.stringify({
            type: 'correct',
            correctAnswer: rooms[roomId].correctAnswer,
            winner: message.sender
        }), senderWs);

        rooms[roomId].correctAnswer = null;
        rooms[roomId].roundFinishtime = null;
    }
}

