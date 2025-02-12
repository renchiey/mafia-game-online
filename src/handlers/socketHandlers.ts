import { WebSocket } from "ws";
import { Message, GamePhase, Player, Room, GameEvent, Client } from "../types";
import { removePlayer, setName } from "./gameHandlers";

const clients = new Map<string, Client>();

export function onConnection(clientId: string, ws: WebSocket) {
  clients.set(clientId, { ws });

  console.log(`Client connected with ID: ${clientId}`);

  // sending client their unique ID
  ws.send(JSON.stringify({ type: "your-id", id: clientId }));
}

export function handleSetName(data: Message) {
  try {
    if (!data.roomId) {
      throw new Error("RoomId is required for set name.");
    }

    setName(data);
  } catch (error) {
    console.error("Error setting name:", error);
  }
}

export function handleJoinRoom(ws: WebSocket, data: Message) {
  const player: Player = {
    clientId: data.clientId,
    socket: ws,
  };

  if (data.event == GameEvent.JOIN_ROOM && !data.roomId) {
    throw new Error("RoomId is required to join a room");
  }

  if (data.event == GameEvent.JOIN_ROOM) {
  }
}

export function handleLeaveRoom(data: Message) {}

export function handleClose(clientId: string) {
  console.log("Client disconnected");

  try {
    const roomId = clients.get(clientId)?.roomId;

    removePlayer(clientId, roomId as string);
  } catch (error) {
    console.error("Error closing connection:", error);
  }
}
