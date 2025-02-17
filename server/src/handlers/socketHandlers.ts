import { WebSocket } from "ws";
import {
  GamePhase,
  Player,
  Room,
  Message,
  MessageType,
} from "../../../shared/types";
import { Client } from "../types";
import {
  addRole,
  changeSettings,
  generateEmptyRoom,
  getRoom,
  joinRoom,
  removePlayer,
  removeRole,
  setName,
  settingOptions,
} from "./gameHandlers";
import { ROLES } from "../utils/roles";
import { instanceOfRole, instanceOfSettings } from "../utils/typeCheck";

const clients = new Map<string, Client>();

export function onConnection(clientId: string, ws: WebSocket) {
  clients.set(clientId, { ws });

  console.log(`[SERVER EVENT] Client connected with ID: ${clientId}`);
}

export function handleSetName(clientId: string, message: Message) {
  const roomId = clients.get(clientId)?.roomId;
  if (!roomId) throw Error("Client is not in a room.");

  setName(clientId, message);

  broadcastStateToRoom(roomId);
}

export function handleJoinRoom(
  clientId: string,
  ws: WebSocket,
  message: Message
) {
  const player: Player = {
    clientId,
  };

  let roomId;

  try {
    if (message.type == MessageType.JOIN_ROOM && !message.data)
      throw new Error("RoomId is required to join a room.");

    if (message.type == MessageType.JOIN_ROOM) {
      if (!joinRoom(player, message.data)) {
        sendMessage(ws, {
          type: MessageType.INVALID_ROOM,
          data: "RoomId could not be found.",
        });

        return;
      }

      roomId = message.data;
    }

    if (message.type == MessageType.CREATE_ROOM) {
      roomId = generateEmptyRoom(player);
    }

    (clients.get(clientId) as Client).roomId = roomId;

    ws.send(JSON.stringify({ type: MessageType.JOINED_ROOM, data: roomId }));

    console.log(`[SERVER EVENT] Client ${clientId} has joined a room.`);

    // broadcast new state to room
    broadcastStateToRoom(roomId);
  } catch (error) {
    console.error("Error joining game:", error);
  }
}

export function handleLeaveRoom(clientId: string) {
  const roomId = clients.get(clientId)?.roomId;

  if (!roomId) throw Error("Client is not in a room.");

  removePlayer(clientId, roomId);

  if (getRoom(roomId)) broadcastStateToRoom(roomId);
}

export function handleKickClient(message: Message) {
  const clientId = message.data;
  if (typeof clientId !== "string") throw Error("Sent data is not a string");

  handleLeaveRoom(clientId);

  sendMessage(clients.get(clientId)?.ws as WebSocket, {
    type: MessageType.KICKED,
    data: "",
  });
}

export function handleClose(clientId: string) {
  const roomId = clients.get(clientId)?.roomId;

  if (roomId) handleLeaveRoom(clientId);

  clients.delete(clientId);

  console.log(`[SERVER EVENT] Client ${clientId} has disconnected.`);
}

export function handleGet(clientId: string, ws: WebSocket, message: Message) {
  const roomId = clients.get(clientId)?.roomId;

  if (!roomId) {
    console.log(`[SERVER ERR] Client ${clientId} not in room.`);
    return;
  }

  let msg_out: Message;

  switch (message.type) {
    case MessageType.GET_ROLES:
      msg_out = {
        type: MessageType.ROLES,
        data: ROLES,
      };
      break;
    case MessageType.GET_STATE:
      msg_out = {
        type: MessageType.STATE,
        data: {
          room: getRoom(roomId),
          clientId: clientId,
        },
      };
      break;
    case MessageType.GET_SETTING_OPTS:
      msg_out = {
        type: MessageType.SETTING_OPTS,
        data: settingOptions,
      };
      break;
    default:
      throw new Error("Invalid message type.");
  }

  sendMessage(ws, msg_out);
}

export function handleAddRole(clientId: string, message: Message) {
  if (!instanceOfRole(message.data)) {
    console.log(
      "[SERVER ERR]: Sent role format does not match role format on server."
    );

    return;
  }

  addRole(clients.get(clientId)?.roomId as string, message.data);

  broadcastStateToRoom(clients.get(clientId)?.roomId as string);
}

export function handleRemoveRole(clientId: string, message: Message) {
  if (typeof message.data !== "number") {
    console.log("[SERVER ERR]: Sent data is not a number.");
    return;
  }

  const roomId = clients.get(clientId)?.roomId as string;

  if (!removeRole(roomId, message.data)) {
    console.log(`[SERVER ERR]: index ${message.data} is invalid`);
  }

  broadcastStateToRoom(roomId);
}

function broadcastStateToRoom(roomId: string) {
  if (!roomId) return;

  const room = getRoom(roomId);

  if (!room) throw new Error("Invalid roomId.");

  room.players.forEach((player) => {
    const client = (clients.get(player.clientId) as Client).ws;

    sendMessage(client, {
      type: MessageType.STATE,
      data: {
        room: room,
        clientId: player.clientId,
      },
    });
  });
}

export function handleChangeSettings(clientId: string, msg: Message) {
  if (!instanceOfSettings(msg.data)) throw new Error("Invalid message.");

  const roomId = clients.get(clientId)?.roomId;

  if (!roomId) throw new Error("Client not in room.");

  changeSettings(roomId, msg.data);
  broadcastStateToRoom(roomId);
}

function broadcastToRoom(roomId: string, message: Message) {
  const room = getRoom(roomId);

  if (!room) throw new Error("Invalid roomId.");

  room.players.forEach((player) => {
    const client = (clients.get(player.clientId) as Client).ws;

    sendMessage(client, message);
  });
}

export function sendMessage(client: WebSocket, message: Message) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

export function getClientRoomId(clientId: string) {
  return clients.get(clientId)?.roomId;
}

export function removeClientFromRoom(clientId: string) {
  (clients.get(clientId) as Client).roomId = undefined;
}
