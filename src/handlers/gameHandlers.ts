import { Message, GamePhase, Player, Room } from "../types";

const rooms = new Map<string, Room>();

export function setName(data: Message) {
  // processing name
  let username = (data.data as string).trim().slice(20);

  const room = rooms.get(data.roomId);

  if (!username) {
    const numPlayers = room?.players.length;

    username = `Player ${numPlayers}`;
  }

  const player = room?.players.find((player) => player.clientId == data.clientId);

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
  } while (rooms.has);

  const room: Room = {
    roomId,
    creator: host.clientId,
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
  return roomId;
}

export function joinRoom(player: Player, roomId: string) {
  if (!rooms.has(roomId)) throw new Error("Invalid roomId.");
}

export function removePlayer(clientId: string, roomId: string) {
  const index = rooms.get(roomId)?.players.findIndex((player) => player.clientId == clientId);

  rooms.get(roomId)?.players.splice(index as number, 1);
}
