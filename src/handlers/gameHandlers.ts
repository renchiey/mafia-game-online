import { GamePhase, Message, Player, Room } from "../types";
import { getClientRoomId } from "./socketHandlers";

const rooms = new Map<string, Room>();

export function setName(clientId: string, data: Message) {
  // processing name
  let username = (data.data as string).trim().slice(20);

  const room = rooms.get(getClientRoomId(clientId) as string);

  if (!username) {
    const numPlayers = room?.players.length;

    username = `Player ${numPlayers}`;
  }

  const player = room?.players.find((player) => player.clientId == clientId);

  (player as Player).username = username;
}

export function generateRoomId() {
  return String("xxxx-xxxx-xxxx-xxxx").replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

export function generateEmptyRoom(host: Player) {
  let roomId;

  do {
    roomId = generateRoomId();
  } while (rooms.has(roomId));

  const room: Room = {
    roomId,
    host: host.clientId,
    players: [host],
    gameState: {
      round: 0,
      phase: GamePhase.NIGHT,
      dead: [],
    },
    settings: {
      maxPlayers: 10, // Default max players
      roundSpeed: 1, // default round speed (multiplier value)
      roles: [],
    },
  };

  rooms.set(roomId, room);
  console.log(`Room ${roomId} has been created`);
  return roomId;
}

export function joinRoom(player: Player, roomId: string) {
  const room = rooms.get(roomId);

  if (!room) {
    return false;
  }

  room?.players.push(player);
  return true;
}

export function removePlayer(clientId: string, roomId: string) {
  const room = rooms.get(roomId);

  const index = room?.players.findIndex(
    (player) => player.clientId == clientId
  );

  const [player] = rooms
    .get(roomId)
    ?.players.splice(index as number, 1) as Player[];

  // closing room
  if (room?.players.length == 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} has closed.`);
    return;
  }

  // setting new host
  if (player.clientId === room?.host) {
    const id = room.players[0].clientId;

    room.host = id;
  }
}

export function getRoom(roomId: string) {
  return rooms.get(roomId);
}
