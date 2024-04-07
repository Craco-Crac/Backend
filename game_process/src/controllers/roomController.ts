import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

// In-memory storage for rooms
export const rooms: Record<string, {
    admins: Set<WebSocket>; users: Set<WebSocket>;
    maxAdmins: number; correctAnswer: string | null;
    roundFinish: number | null;
}> = {};

export const createRoom = (req: Request, res: Response) => {
    const maxAdmins = parseInt(req.body.admins as string);
    if (!maxAdmins) {
        res.status(400).json({ error: 'Please provide a valid number of admins' });
    }
    const roomId = uuidv4();
    rooms[roomId] = {
        admins: new Set(), users: new Set(),
        maxAdmins: maxAdmins, correctAnswer: null, roundFinish: null
    };
    res.status(201).json({ roomId });
};

export const startRound = (req: Request, res: Response) => {

    const finishTime = Date.now() + parseInt(req.body.roundTime as string);
    const ans = req.body.answer as string;
    if (!finishTime || !ans) {
        res.status(400).json({ error: 'Please provide a valid finish time and answer' });
    }
    const roomId = req.params.roomId;
    rooms[roomId].roundFinish = finishTime;
    rooms[roomId].correctAnswer = ans;

    const currentTime = Date.now();
    const delayUntilFinish = finishTime - currentTime;

    setTimeout(() => {
        sendToRoom(roomId, "The round has ended. Here's the correct answer: ...");
    }, delayUntilFinish);
    res.status(200).json({ roomId });

};

function sendToRoom(roomId: string, message: string) {
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