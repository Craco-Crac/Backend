import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sendToRoom, closeConnectionsInRoom } from '../utils/roomUtils';

export const rooms: Record<string, {
    admins: Set<WebSocket>; users: Set<WebSocket>;
    maxAdmins: number; correctAnswer: string | null;
    roundFinishtime: number | null; roundFinishTimeout: NodeJS.Timeout | undefined;
}> = {};

export const createRoom = (req: Request, res: Response) => {
    const maxAdmins = parseInt(req.body.admins as string);
    if (!maxAdmins) {
        res.status(400).json({ error: 'Please provide a valid number of admins' });
    }
    const roomId = uuidv4();
    rooms[roomId] = {
        admins: new Set(), users: new Set(),
        maxAdmins: maxAdmins, correctAnswer: null, roundFinishtime: null,
        roundFinishTimeout: undefined,
    };
    res.status(201).json({ roomId });
};

export const deleteRoom = (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (rooms[roomId]) {
        try {
            closeConnectionsInRoom(roomId);
        }
        catch (e) {
            console.log(e)
            res.status(500).json({ error: 'Error while closing connections in room' });
        }
        clearTimeout(rooms[roomId].roundFinishTimeout);
        delete rooms[roomId];
        console.log(`Room with ID ${roomId} has been deleted.`);
        res.status(204).send();
    } else {
        console.log(`Room with ID ${roomId} does not exist.`);
        res.status(404).json({ error: 'Room does not exist' });
    }
};

export const startRound = (req: Request, res: Response) => {
    const roomId = req.params.roomId;
    if (!rooms[roomId]) {
        return res.status(400).json({ error: 'Room does not exist' });
    }
    else if (rooms[roomId].roundFinishtime) {
        return res.status(400).json({ error: 'Round already started' });
    }
    const delayUntilFinish = parseInt(req.body.delayUntilFinish as string);
    const finishTime = Date.now() + delayUntilFinish;
    const ans = req.body.answer as string;
    if (!finishTime || !ans) {
        res.status(400).json({ error: 'Please provide a valid finish time and answer' });
    }
    rooms[roomId].roundFinishtime = finishTime;
    rooms[roomId].correctAnswer = ans;
    try {
        sendToRoom(roomId, JSON.stringify({ type: "round-start", delayUntilFinish: delayUntilFinish }));
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: 'Error while sending to room' });
    }

    rooms[roomId].roundFinishTimeout = setTimeout(() => {
        if (rooms[roomId].correctAnswer) {
            rooms[roomId].correctAnswer = null;
            rooms[roomId].roundFinishtime = null;
            try {
                sendToRoom(roomId, JSON.stringify({ type: "round-finish", correctAnswer: ans }));
            } catch (e) {
                console.log(e);
                return res.status(500).json({ error: 'Error while sending to room' });
            }
        }
    }, delayUntilFinish);
    res.status(200).json({ roomId });

};
