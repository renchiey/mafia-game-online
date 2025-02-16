import {
  GamePhase,
  Message,
  Player,
  Role,
  Room,
  Settings,
  SettingsOptions,
} from "../types";
import { getClientRoomId } from "./socketHandlers";

const rooms = new Map<string, Room>();

export const settingOptions: SettingsOptions = {
  maxPlayers: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  roundSpeed: [1, 1.25, 1.5, 1.75, 2],
};

export function setName(clientId: string, data: Message) {
  // processing name
  let username = (data.data as string).trim().slice(0, 20);

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
    rolesPool: [],
    gameState: {
      round: 0,
      phase: GamePhase.NIGHT,
      dead: [],
    },
    settings: {
      maxPlayers: 10, // Default max players
      roundSpeed: 1, // default round speed (multiplier value)
      revealRoleAfterDeath: false,
      narrator: true,
    },
  };

  rooms.set(roomId, room);
  console.log(`[SERVER EVENT] Room ${roomId} has been created`);
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

  if (!room) return;

  // closing room
  if (room.players.length == 0) {
    rooms.delete(roomId);
    console.log(`[SERVER EVENT] Room ${roomId} has closed.`);
    return;
  }

  // setting new host
  if (player.clientId === room.host) {
    const id = room.players[0].clientId;

    room.host = id;
  }

  if (room.players.length < room.rolesPool.length) {
    room.rolesPool.pop();
  }
}

export function addRole(roomId: string, role: Role) {
  const room = rooms.get(roomId);

  room?.rolesPool.push(role);

  // sort based on name
  room?.rolesPool.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  // sort based on allegiance
  room?.rolesPool.sort((a, b) => {
    if (a.allegiance.name < b.allegiance.name) {
      return -1;
    } else if (a.allegiance.name > b.allegiance.name) {
      return 1;
    }
    return 0;
  });
}

export function removeRole(roomId: string, index: number) {
  const room = rooms.get(roomId) as Room;

  if (index < 0 || index >= room?.rolesPool.length) {
    return null;
  }

  return room.rolesPool.splice(index, 1)[0];
}

export function changeSettings(roomId: string, settings: Settings) {
  const room = rooms.get(roomId) as Room;

  room.settings = settings;
}

// for socket handler
export function getRoom(roomId: string) {
  return rooms.get(roomId);
}
