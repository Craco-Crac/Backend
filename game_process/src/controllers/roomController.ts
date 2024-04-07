import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

// In-memory storage for rooms
export const rooms: Record<string, { admin: WebSocket | null; users: Set<WebSocket> }> = {};

// Controller function to handle room creation
export const createRoom = (req: Request, res: Response) => {
  // Generate a unique room ID
  const roomId = uuidv4();

  // Initialize the room with no admin and an empty set of users
  rooms[roomId] = { admin: null, users: new Set() };

  // Respond with the new room ID
  res.status(201).json({ roomId });
};
