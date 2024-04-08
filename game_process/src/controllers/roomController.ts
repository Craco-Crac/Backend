import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sendToRoom } from '../utils/sendToRooms';

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

export const deleteRoom = (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (rooms[roomId]) {
        delete rooms[roomId];
        console.log(`Room with ID ${roomId} has been deleted.`);
    } else {
        console.log(`Room with ID ${roomId} does not exist.`);
    }
    res.status(204).json({ roomId });
};

export const startRound = (req: Request, res: Response) => {

    const delayUntilFinish = parseInt(req.body.delayUntilFinish as string);
    const finishTime = Date.now() + delayUntilFinish;
    const ans = req.body.answer as string;
    if (!finishTime || !ans) {
        res.status(400).json({ error: 'Please provide a valid finish time and answer' });
    }
    const roomId = req.params.roomId;
    if(!rooms[roomId]) {
        return res.status(400).json({ error: 'Room does not exist' });
    }
    rooms[roomId].roundFinish = finishTime;
    rooms[roomId].correctAnswer = ans;

    sendToRoom(roomId, JSON.stringify({ type: "round-start", delayUntilFinish: delayUntilFinish }));

    setTimeout(() => {
        if (rooms[roomId].correctAnswer) {
            rooms[roomId].correctAnswer = null;
            rooms[roomId].roundFinish = null;
            sendToRoom(roomId, JSON.stringify({ type: "round-finish", correctAnswer: ans }));
        }
    }, delayUntilFinish);
    res.status(200).json({ roomId });

};
