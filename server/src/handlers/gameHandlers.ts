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
  Tuple,
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
      votes: {},
      endTurn: new Set(),
      veteranShotsRemaining: 3,
    },
    settings: {
      maxPlayers: 10, // Default max players
      turnSpeed: 1, // default round speed (multiplier value)
      discussionDuration: 30, // Default discussion duration
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
    endTurn: new Set(),
    votes: {},
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

export function nextPhase(roomId: string): GamePhase {
  /**
   * Gets the next phase for an active game.
   */
  const room = rooms.get(roomId) as Room;

  let phase: GamePhase;
  let timeout: number = 0;
  switch (room.gameState.gamePhase) {
    case GamePhase.BEGINNING:
      phase = transitionPhaseHelper(roomId, 0);
      break;
    case GamePhase.NIGHT:
      phase = transitionPhaseHelper(roomId, 1);
      break;
    case GamePhase.MAFIOSO_TURN:
      phase = transitionPhaseHelper(roomId, 2);
      break;
    case GamePhase.DOCTOR_TURN:
      phase = transitionPhaseHelper(roomId, 3);
      break;
    case GamePhase.INVESTIGATOR_TURN:
      phase = transitionPhaseHelper(roomId, 4);
      break;
    case GamePhase.TRANSPORTER_TURN:
      phase = transitionPhaseHelper(roomId, 5);
      break;
    case GamePhase.NIGHT_OUTCOME:
    case GamePhase.DISCUSSION:
    case GamePhase.VOTING:
    case GamePhase.VOTING_OUTCOME:
      phase = transitionPhaseHelper(roomId, 6);
      break;
    default:
      phase = GamePhase.BEGINNING;

      endGame(roomId);
  }

  return phase;
}

function transitionPhaseHelper(roomId: string, pass: number): GamePhase {
  /**
   * Helper function to transition game state to next phase
   */
  const room = rooms.get(roomId) as Room;

  if (pass === 0) {
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return gameOver;
    }
    room.gameState.gamePhase = GamePhase.NIGHT;

    return GamePhase.NIGHT;
  }

  let turnPhase = false;

  if (pass <= 1 && roomHasRole(roomId, GameRole.MAFIOSO)) {
    // Mafioso turn
    turnPhase = true;

    room.gameState.gamePhase = GamePhase.MAFIOSO_TURN;
  } else if (pass <= 2 && roomHasRole(roomId, GameRole.DOCTOR)) {
    // Doctor turn
    turnPhase = true;
    room.gameState.gamePhase = GamePhase.DOCTOR_TURN;
  } else if (pass <= 3 && roomHasRole(roomId, GameRole.INVESTIGATOR)) {
    // Investigator Turn
    turnPhase = true;
    room.gameState.gamePhase = GamePhase.INVESTIGATOR_TURN;
  } else if (pass <= 4 && roomHasRole(roomId, GameRole.TRANSPORTER)) {
    // Transporter Turn
    turnPhase = true;
    room.gameState.gamePhase = GamePhase.TRANSPORTER_TURN;
  }

  if (turnPhase) return room.gameState.gamePhase;

  if (pass <= 5) {
    // Reveal night outcome phase
    room.gameState.gamePhase = GamePhase.NIGHT_OUTCOME;
  } else if (room.gameState.gamePhase === GamePhase.NIGHT_OUTCOME) {
    // Discussion phase
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return gameOver;
    }
    room.gameState.gamePhase = GamePhase.DISCUSSION;
  } else if (room.gameState.gamePhase === GamePhase.DISCUSSION) {
    // Voting phase
    room.gameState.gamePhase = GamePhase.VOTING;
  } else if (room.gameState.gamePhase === GamePhase.VOTING) {
    // Voting outcome phase

    room.gameState.gamePhase = GamePhase.VOTING_OUTCOME;
  } else {
    // Night phase
    const gameOver = checkGameOver(roomId);

    if (gameOver) {
      return gameOver;
    }
    room.gameState.gamePhase = GamePhase.NIGHT;

    room.gameState.actions = {}; // resetting actions

    room.gameState.round++;
  }

  return room.gameState.gamePhase;
}

function checkGameOver(roomId: string): GamePhase | null {
  const room = rooms.get(roomId) as Room;

  let mafia_alive = 0;
  room.gameState.mafia.forEach((player) => {
    if (player.gameData.dead === undefined) mafia_alive++;
  });

  let towns_alive = 0;
  room.gameState.towns.forEach((player) => {
    if (player.gameData.dead === undefined) towns_alive++;
  });

  let jester_lynched = false;
  room.gameState.neutrals.forEach((player) => {
    if (
      player.gameData.dead &&
      player.gameData.role?.name === GameRole.JESTER &&
      player.gameData.dead === DeathType.LYNCHED
    )
      jester_lynched = true;
  });

  console.log(`MAFIA ALIVE: ${mafia_alive}, TOWNS ALIVE: ${towns_alive}`);

  if (jester_lynched) {
    room.gameState.gamePhase = GamePhase.JESTER_WIN;

    return GamePhase.JESTER_WIN;
  }

  if (towns_alive <= mafia_alive) {
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
    case GameMessageType.VOTE_LYNCH:
      if (clientId in gameState.votes) {
        gameState.votes[clientId] = target;

        return [
          `${playerUsername} changed their vote to ${targetUsername}.`,
          room.players.map((p) => p.clientId),
        ];
      }

      gameState.votes[clientId] = target;
      return [
        `${playerUsername} voted to lynch ${targetUsername}.`,
        room.players.map((p) => p.clientId),
      ];
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

export function processNightOutcome(roomId: string) {
  const room = rooms.get(roomId) as Room;

  const gameState = room.gameState;

  const actions = gameState.actions;

  const outcomeTexts: string[] = [];

  const died: string[] = [];

  if (actions.killVoted) {
    let [target, attacker] =
      actions.killVoted[Math.floor(Math.random()) * actions.killVoted.length];

    // if target was swapped, set target to swapped player
    if (actions.transported) {
      console.log(`target ${target}`);
      console.log(`transported ${actions.transported}`);
      actions.transported.forEach((t) => {
        const swapped = t[0];

        if (swapped[0] === target) {
          target = swapped[1];
        }

        if (swapped[1] === target) {
          target = swapped[0];
        }
      });
    }

    // if target was an active veteran
    const veteranAttacked = actions.veteranActive
      ? actions.veteranActive.find((p) => p === target[0])
      : undefined;

    if (veteranAttacked) {
      died.push(attacker);
    } else {
      died.push(target);
    }
  }

  if (actions.healed) {
    actions.healed.forEach((healed) => {
      let [target, docter] = healed;

      // if target was swapped, set target to swapped player
      if (actions.transported) {
        actions.transported.forEach((t) => {
          const swapped = t[0];

          if (swapped[0] === target) {
            target = swapped[1];
          }

          if (swapped[1] === target) {
            target = swapped[0];
          }
        });
      }

      // if target was dead, remove them from list of dead
      const dead = died.findIndex((d) => d === target);
      if (dead >= 0) {
        died.splice(dead, 1);

        const targetName = (
          room.players.find((p) => p.clientId === target) as Player
        ).username;

        outcomeTexts.push(
          `${targetName} was attacked last night, but was saved by a Doctor.`
        );
      }

      // if target was an active veteran
      const veteranAttacked = actions.veteranActive
        ? actions.veteranActive.find((p) => p === target[0])
        : undefined;

      if (veteranAttacked) {
        died.push(docter);
      }
    });
  }

  for (const pId of died) {
    const player = room.players.find((p) => p.clientId === pId) as Player;

    player.gameData.dead = DeathType.KILLED;

    outcomeTexts.push(`${player.username} died last night.`);
  }

  return outcomeTexts;
}

export function processVotingOutcome(roomId: string) {
  const room = rooms.get(roomId) as Room;

  const votes = room.gameState.votes;

  const tally: Record<string, number> = {};

  for (const [pId, voteeId] of Object.entries(votes)) {
    if (!(voteeId in tally)) tally[voteeId] = 0;

    tally[voteeId] += 1;
  }

  let highest = null;
  let tiedPlayer = null;
  for (const [pId, count] of Object.entries(tally)) {
    {
      if (!highest) highest = pId;
      else if (tally[highest] < count) highest = pId;
      else if (tally[highest] === count) tiedPlayer = pId;
    }
  }

  if (highest === null) {
    return "No one was voted off today.";
  }

  if (tiedPlayer && highest && tally[tiedPlayer] === tally[highest]) {
    return "No one was voted off today.";
  }

  const voteePlayer = room.players.find(
    (p) => p.clientId === highest
  ) as Player;

  voteePlayer.gameData.dead = DeathType.LYNCHED;

  return `${voteePlayer.username} was voted off.`;
}

function roomHasRole(roomId: string, role: GameRole) {
  const room = rooms.get(roomId);

  if (!room) return false;

  for (const r of room.rolesPool) {
    if (r.name === role) return true;
  }

  return false;
}
