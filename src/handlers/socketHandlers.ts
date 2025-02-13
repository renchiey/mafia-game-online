import { WebSocket } from "ws";
import {
  GamePhase,
  Player,
  Room,
  Client,
  Message,
  MessageType,
} from "../types";
import {
  generateEmptyRoom,
  getRoom,
  joinRoom,
  removePlayer,
  setName,
} from "./gameHandlers";

const clients = new Map<string, Client>();

export function onConnection(clientId: string, ws: WebSocket) {
  clients.set(clientId, { ws });

  console.log(`Client connected with ID: ${clientId}`);
}

export function handleSetName(clientId: string, data: Message) {
  try {
    setName(clientId, data);

    console.log(`Player ${clientId} has set their username to: ${data.data}`);
  } catch (error) {
    console.error("Error setting name:", error);
  }
}

export function handleJoinRoom(clientId: string, ws: WebSocket, data: Message) {
  const player: Player = {
    clientId,
  };

  let roomId;

  try {
    if (data.type == MessageType.JOIN_ROOM && !data.data)
      throw new Error("RoomId is required to join a room");

    if (data.type == MessageType.JOIN_ROOM) {
      if (!joinRoom(player, data.data)) {
        ws.send(
          JSON.stringify({
            type: MessageType.INVALID_ROOM,
            data: "RoomId could not be found.",
          })
        );
        return;
      }

      roomId = data.data;
    }

    if (data.type == MessageType.CREATE_ROOM) {
      roomId = generateEmptyRoom(player);
    }

    (clients.get(clientId) as Client).roomId = roomId;

    ws.send(JSON.stringify({ type: MessageType.JOINED_ROOM, data: roomId }));

    console.log(`Player ${clientId} has joined a room.`);

    // broadcast new state to room
    broadcastStateToRoom(roomId);
  } catch (error) {
    console.error("Error joining game:", error);
  }
}

export function handleLeaveRoom(clientId: string) {
  try {
    const roomId = clients.get(clientId)?.roomId;

    if (!roomId) throw new Error("Player is not in a room.");

    removePlayer(clientId, roomId);

    if (getRoom(roomId)) broadcastStateToRoom(roomId);
  } catch (error) {
    console.error("Error leaving game:", error);
  }
}

export function handleClose(clientId: string) {
  const roomId = clients.get(clientId)?.roomId;

  if (roomId) {
    handleLeaveRoom(clientId);
  }

  clients.delete(clientId);

  console.log(`Client ${clientId} has disconnected.`);
}

export function handleSendUpdate(clientId: string, ws: WebSocket) {
  const roomId = clients.get(clientId)?.roomId;

  if (!roomId) {
    console.log(`Client ${clientId} not in room.`);
    return;
  }

  const room = getRoom(roomId);

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: MessageType.STATE_UPDATE,
        data: {
          roomData: room,
          clientId: clientId,
        },
      })
    );
  }
}

function broadcastStateToRoom(roomId: string) {
  const room = getRoom(roomId);

  if (!room) throw new Error("Invalid roomId.");

  room.players.forEach((player) => {
    const client = (clients.get(player.clientId) as Client).ws;
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: MessageType.STATE_UPDATE,
          data: {
            roomData: room,
            clientId: player.clientId,
          },
        })
      );
    }
  });
}

export function getClientRoomId(clientId: string) {
  return clients.get(clientId)?.roomId;
}
