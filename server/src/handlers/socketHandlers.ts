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
import { removeItem } from "../utils/helper";

const clients = new Map<string, Client>();

// To do real-time update on if a room is joinable
const roomRequested = new Map<string, string[]>(); // roomId -> clientId[]

export function onConnection(clientId: string, ws: WebSocket) {
  clients.set(clientId, { ws });

  console.log(`[SERVER EVENT] Client connected with ID: ${clientId}`);
}

export function handleSetName(clientId: string, message: Message) {
  const roomId = clients.get(clientId)?.roomId;
  if (!roomId) {
    console.log("[SERVER ERROR] Client is not in a room.");
    return;
  }

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
      const room = getRoom(message.data);

      if (!room) {
        sendMessage(ws, {
          type: MessageType.INVALID_ROOM,
          data: "RoomId could not be found.",
        });

        return;
      }

      if (room.players.length === room.settings.maxPlayers) {
        sendMessage(ws, {
          type: MessageType.ROOM_FULL,
          data: "",
        });

        return;
      }

      joinRoom(player, message.data);

      roomId = message.data;

      const requested = clients.get(clientId)?.roomRequested;

      if (requested && roomRequested.has(roomId)) {
        removeItem(roomRequested.get(roomId) as string[], clientId);

        delete (clients.get(clientId) as Client).roomRequested;
      }

      if (roomRequested.get(roomId)?.length === 0) {
        roomRequested.delete(roomId);
      } else {
        if (room.players.length === room.settings.maxPlayers) {
          roomRequested.get(roomId)?.forEach((clientId) => {
            const client = (clients.get(clientId) as Client).ws;

            sendMessage(client, {
              type: MessageType.ROOM_FULL,
              data: "",
            });
          });
        }
      }
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

  const roomId = clients.get(clientId)?.roomId as string;
  handleLeaveRoom(clientId);

  sendMessage(clients.get(clientId)?.ws as WebSocket, {
    type: MessageType.KICKED,
    data: "",
  });

  if (roomRequested.has(roomId)) {
    roomRequested.get(roomId)?.forEach((clientId) => {
      const client = (clients.get(clientId) as Client).ws;

      sendMessage(client, {
        type: MessageType.ROOM_JOINABLE,
        data: "",
      });
    });
  }
}

export function handleClose(clientId: string) {
  const roomId = clients.get(clientId)?.roomId;
  const requested = clients.get(clientId)?.roomRequested;

  if (roomId) handleLeaveRoom(clientId);

  // clean up
  if (requested && roomRequested.has(requested)) {
    removeItem(roomRequested.get(requested) as string[], clientId);
    roomRequested.get(clientId);

    if (roomRequested.get(requested)?.length === 0) {
      roomRequested.delete(requested);
    }
  }

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

export function handleCheckRoom(clientId: string, ws: WebSocket, msg: Message) {
  const roomId: string = msg.data;

  if (!roomId) throw new Error(`Invalid message data: ${msg.data}`);

  if (roomId == "no-room-id-provided") return;

  let joinable = true;

  const room = getRoom(roomId);

  if (!room) {
    sendMessage(ws, {
      type: MessageType.INVALID_ROOM,
      data: "",
    });

    joinable = false;
  }

  if (room && room.settings.maxPlayers === room.players.length) {
    sendMessage(ws, {
      type: MessageType.ROOM_FULL,
      data: "",
    });

    joinable = false;
  }

  if (joinable)
    sendMessage(ws, {
      type: MessageType.ROOM_JOINABLE,
      data: "",
    });

  // Enables push updates to clients requesting room in real time
  (clients.get(clientId) as Client).roomRequested = roomId;

  if (roomRequested.has(roomId)) {
    roomRequested.get(roomId)?.push(clientId);
  } else {
    roomRequested.set(roomId, [clientId]);
  }
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

export function handleStartGame(clientId: string) {
  const roomId = clients.get(clientId)?.roomId;

  if (!roomId) throw new Error("Client not in room.");

  const room = getRoom(roomId) as Room;

  const message = {
    type: MessageType.START_GAME,
    data: "",
  };

  room.gameStarted = true;

  room.players.forEach((player) => {
    const client = (clients.get(player.clientId) as Client).ws;
    sendMessage(client, message);
  });
}

export function handleGameEvent(clientId: string, message: Message) {}
