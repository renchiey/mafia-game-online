import {
  Actions,
  AllegianceType,
  DeathType,
  GameMessageData,
  GameMessageType,
  GamePhase,
  GameRole,
  Message,
  Player,
  Role,
  Room,
  Settings,
  SettingsOptions,
} from "../../../shared/types";
import { MessageType } from "../../../shared/types";
import { getClientRoomId, removeClientFromRoom } from "./socketHandlers";

const rooms = new Map<string, Room>();

export const settingOptions: SettingsOptions = {
  maxPlayers: [4, 5, 6, 7, 8, 9, 10, 11, 12],
  roundSpeed: [1, 1.25, 1.5, 1.75, 2],
};

const MIN_PLAYERS = 4;

const DISCUSSION_TIMEOUT = 60000; // 1 minute

const VOTING_TIMEOUT = 10000; // 10 seconds

const TURN_TIMEOUT = 15000; // 15 seconds

const STAGGER_TIMEOUT = 1000; // 1 second

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

  return username;
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
      gamePhase: GamePhase.NIGHT,
      mafia: [],
      towns: [],
      neutrals: [],
      actions: {},
      endTurn: 0,
      veteranShotsRemaining: 3,
    },
    settings: {
      maxPlayers: 10, // Default max players
      roundSpeed: 1, // default round speed (multiplier value)
      revealRoleAfterDeath: false,
      narrator: true,
      veteranShots: 3,
    },
    gameStarted: false,
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

  removeClientFromRoom(player.clientId);

  if (!room) return;

  endGame(roomId);

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

export function startGame(roomId: string): MessageType {
  const room = rooms.get(roomId) as Room;

  if (room.players.length < MIN_PLAYERS) return MessageType.NOT_ENOUGH_PLAYERS;

  if (room.rolesPool.length < room.players.length)
    return MessageType.FILL_ROLE_POOL;

  room.gameStarted = true;

  // reset game state
  room.gameState = {
    round: 1,
    gamePhase: GamePhase.BEGINNING,
    mafia: [],
    towns: [],
    neutrals: [],
    actions: {},
    endTurn: 0,
    veteranShotsRemaining: 3,
  };

  // assign roles to each player
  assignPlayerRoles(room);

  return MessageType.START_GAME;
}

function assignPlayerRoles(room: Room) {
  /**
   * Assigns each player in the room a role
   */
  const roles = [...room.rolesPool];

  let pIndex = 0;
  while (roles.length > 0) {
    const player = room.players[pIndex];

    const roleIndex = Math.floor(Math.random() * roles.length);
    const role = roles[roleIndex];

    player.gameData = {
      role: role,
    };

    if (role.allegiance.name === AllegianceType.MAFIA) {
      room.gameState.mafia.push(player);
    }

    if (role.allegiance.name === AllegianceType.TOWN) {
      room.gameState.towns.push(player);
    }

    if (role.allegiance.name === AllegianceType.NEUTRAL) {
      room.gameState.neutrals.push(player);
    }

    roles.splice(roleIndex, 1);
    pIndex++;
  }
}

export function endGame(roomId: string) {
  const room = rooms.get(roomId) as Room;

  room.gameStarted = false;
}

export function nextPhase(roomId: string): [GamePhase, number] {
  /**
   * Gets the next phase for an active game.
   *
   * Returns the time (ms) it should take for the phase to end
   */
  const room = rooms.get(roomId) as Room;

  let phase: GamePhase;
  let timeout: number = 0;
  switch (room.gameState.gamePhase) {
    case GamePhase.BEGINNING:
      [phase, timeout] = transitionPhaseHelper(roomId, 0);
      break;
    case GamePhase.NIGHT:
      [phase, timeout] = transitionPhaseHelper(roomId, 1);
      break;
    case GamePhase.MAFIOSO_TURN:
      [phase, timeout] = transitionPhaseHelper(roomId, 2);
      break;
    case GamePhase.DOCTOR_TURN:
      [phase, timeout] = transitionPhaseHelper(roomId, 3);
      break;
    case GamePhase.INVESTIGATOR_TURN:
      [phase, timeout] = transitionPhaseHelper(roomId, 4);
      break;
    case GamePhase.TRANSPORTER_TURN:
      [phase, timeout] = transitionPhaseHelper(roomId, 5);
      break;
    case GamePhase.DISCUSSION:
      [phase, timeout] = transitionPhaseHelper(roomId, 6);
      break;
    case GamePhase.VOTING:
      [phase, timeout] = transitionPhaseHelper(roomId, 7);
      break;
    default:
      [phase, timeout] = [GamePhase.BEGINNING, 0];

      endGame(roomId);
  }

  return [phase, timeout];
}

function transitionPhaseHelper(
  roomId: string,
  pass: number
): [GamePhase, number] {
  /**
   * Helper function to transition game state to next phase
   *
   * Returns the time (ms) it should take for the phase to end
   */
  const room = rooms.get(roomId) as Room;

  let phase: GamePhase | null = null;

  if (pass === 0) {
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return [gameOver, 0];
    }
    room.gameState.gamePhase = GamePhase.NIGHT;

    return [GamePhase.NIGHT, STAGGER_TIMEOUT];
  }

  if (pass <= 1 && roomHasRole(roomId, GameRole.MAFIOSO)) {
    phase = GamePhase.MAFIOSO_TURN;

    room.gameState.gamePhase = phase;
  } else if (pass <= 2 && roomHasRole(roomId, GameRole.DOCTOR)) {
    phase = GamePhase.DOCTOR_TURN;

    room.gameState.gamePhase = phase;
  } else if (pass <= 3 && roomHasRole(roomId, GameRole.INVESTIGATOR)) {
    phase = GamePhase.INVESTIGATOR_TURN;

    room.gameState.gamePhase = phase;
  } else if (pass <= 4 && roomHasRole(roomId, GameRole.TRANSPORTER)) {
    phase = GamePhase.TRANSPORTER_TURN;

    room.gameState.gamePhase = phase;
  }

  if (phase)
    return [phase, Math.round(TURN_TIMEOUT * (1 / room.settings.roundSpeed))];

  let timeout: number;

  if (pass <= 5) {
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return [gameOver, 0];
    }

    phase = GamePhase.DISCUSSION;

    room.gameState.gamePhase = phase;

    timeout = DISCUSSION_TIMEOUT;
  } else if (pass <= 6) {
    phase = GamePhase.VOTING;

    room.gameState.gamePhase = phase;

    timeout = VOTING_TIMEOUT;
  } else {
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return [gameOver, 0];
    }

    phase = GamePhase.NIGHT;

    room.gameState.gamePhase = phase;

    room.gameState.round++;

    timeout = STAGGER_TIMEOUT;
  }

  return [phase, timeout];
}

function checkGameOver(roomId: string): GamePhase | null {
  const room = rooms.get(roomId) as Room;

  let mafia_alive = 0;
  room.gameState.mafia.forEach((player) => {
    if (!player.gameData?.dead) mafia_alive++;
  });

  let towns_alive = 0;
  room.gameState.towns.forEach((player) => {
    if (!player.gameData?.dead) towns_alive++;
  });

  let jester_lynched = false;
  room.gameState.neutrals.forEach((player) => {
    if (
      player.gameData?.dead &&
      player.gameData.role.name === GameRole.JESTER &&
      player.gameData.dead === DeathType.LYNCHED
    )
      jester_lynched = true;
  });

  if (jester_lynched) {
    room.gameState.gamePhase = GamePhase.JESTER_WIN;

    return GamePhase.JESTER_WIN;
  }

  if (towns_alive < mafia_alive) {
    room.gameState.gamePhase = GamePhase.MAFIA_WIN;

    return GamePhase.MAFIA_WIN;
  }

  if (mafia_alive === 0) {
    room.gameState.gamePhase = GamePhase.TOWNS_WIN;

    return GamePhase.TOWNS_WIN;
  }

  return null;
}

/** returns [chat message, clients to receive message] */
export function handleAction(
  clientId: string,
  roomId: string,
  action: GameMessageData
): [string, string[]] {
  console.log(`Client ${clientId} doing: ${action.type}`);

  const room = rooms.get(roomId) as Room;

  const gameState = room.gameState;

  const playerUsername = room.players.find(
    (p) => p.clientId === clientId
  )?.username;

  const target = action.playerSelected as string;

  const targetUsername = action.playerSelected
    ? room.players.find((p) => p.clientId === action.playerSelected)?.username
    : "";

  const actionsPerformed = gameState.actions;

  let performedActionAlready = false;

  switch (action.type) {
    case GameMessageType.KILL_VOTE:
      if (!actionsPerformed.killVoted) {
        actionsPerformed.killVoted = [];
      }

      for (const vote of actionsPerformed.killVoted) {
        const [votedPlayer, mafiosoPlayer] = vote;

        if (mafiosoPlayer === clientId) {
          vote[0] = target;
          performedActionAlready = true;
        }
      }

      let sentenceStart;
      if (room.gameState.mafia.length > 1) {
        sentenceStart = `${playerUsername} wants`;
      } else {
        sentenceStart = "You want";
      }

      if (performedActionAlready) {
        return [
          `${sentenceStart} to kill ${targetUsername} now!`,
          room.gameState.mafia.map((p) => p.clientId) as string[],
        ];
      }

      actionsPerformed.killVoted.push([target, clientId]);

      return [
        `${sentenceStart} to kill ${targetUsername}!`,
        room.gameState.mafia.map((p) => p.clientId) as string[],
      ];
    case GameMessageType.HEAL:
      if (!actionsPerformed.healed) {
        actionsPerformed.healed = [];
      }

      performedActionAlready = false;
      for (const healed of actionsPerformed.healed) {
        const [healedPlayer, doctorPlayer] = healed;

        if (doctorPlayer === clientId) {
          healed[0] = target;
          performedActionAlready = true;
        }
      }

      if (performedActionAlready) {
        return [`You decided to heal ${targetUsername} instead.`, [clientId]];
      }

      actionsPerformed.healed.push([target, clientId]);

      return [`You decided to heal ${targetUsername}.`, [clientId]];
    case GameMessageType.INVESTIGATE:
      const targetRole = room.players.find((p) => p.clientId === target)
        ?.gameData?.role as Role;

      let grammar = "a";
      if (["a", "e", "i", "o", "u"].includes(targetRole.name[0].toLowerCase()))
        grammar = "an";

      return [
        `You investigated ${targetUsername} and they were ${grammar} ${targetRole.name}!`,
        [clientId],
      ];
    case GameMessageType.TRANSPORT:
      if (!actionsPerformed.transported) {
        actionsPerformed.transported = [];
      }

      performedActionAlready = false;

      let twoPlayersSelected = false;

      let swappedPlayers = ["", ""];

      for (const transported of actionsPerformed.transported) {
        const [transportedPlayers, transporterPlayer] = transported;

        const [p1, p2] = transportedPlayers;

        if (transporterPlayer === clientId) {
          if (p1 && p2) {
            transported[0] = [p2, target];

            swappedPlayers = [p2, target];

            twoPlayersSelected = true;
          } else {
            transported[0] = [p1, target];

            swappedPlayers = [p1, target];

            twoPlayersSelected = true;
          }
        }
      }

      if (!twoPlayersSelected) {
        actionsPerformed.transported.push([[target, null], clientId]);
        return [`You have selected ${targetUsername}.`, [clientId]];
      }

      const p1Username = room.players.find(
        (p) => p.clientId === swappedPlayers[0]
      )?.username;
      const p2Username = room.players.find(
        (p) => p.clientId === swappedPlayers[1]
      )?.username;

      return [
        `You decided to swap ${p1Username} with ${p2Username}.`,
        [clientId],
      ];
    default:
      throw new Error(`${action.type} has not been implemented yet.`);
  }
}

function processNightOutcome(roomId: string) {
  const room = rooms.get(roomId) as Room;

  const gameState = room.gameState;

  const actions = gameState.actions;

  if (actions.transported) {
  }

  if (actions.killVoted) {
    if (actions.healed) {
    }
  }
}

function roomHasRole(roomId: string, role: GameRole) {
  const room = rooms.get(roomId);

  if (!room) return false;

  for (const r of room.rolesPool) {
    if (r.name === role) return true;
  }

  return false;
}
