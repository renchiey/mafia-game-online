export interface Allegiance {
  name: string;
  color: string;
}

export interface Role {
  name: string;
  iconSrc: string;
  allegiance: Allegiance;
  description: string;
}

export interface Player {
  clientId: string;
  username?: string;
  role?: Role;
}

export interface Settings {
  maxPlayers: number;
  roundSpeed: number;
  revealRoleAfterDeath: boolean;
  narrator: boolean;
  veteranShots: number;
}

export interface SettingsOptions {
  maxPlayers: number[];
  roundSpeed: number[];
}

export enum GamePhase {
  NIGHT = 0,
  DISCUSSION = 1,
  VOTING = 2,
  COMPLETE = 3,
}

export interface GameState {
  round: number;
  dead: Player[];
  killVoted?: string[];
  transported?: Transported;
  healed?: string;
  veteranActive?: boolean;
  veteranShotsRemaining: number;
}

export interface Transported {
  clientOneId: string;
  clientTwoId: string;
}

export interface Room {
  roomId: string;
  host: string;
  players: Player[];
  rolesPool: Role[];
  gameState: GameState;
  settings: Settings;
  gameStarted: boolean;
}

export interface Message {
  type: MessageType;
  data: any;
}

export enum MessageType {
  // Client Getters
  GET_STATE = "get-state",
  GET_ROOMID = "get-roomid",
  GET_PLAYERS = "get-players",
  GET_CLIENTID = "get-clientid",
  GET_ROLES = "get-roles",
  GET_SETTING_OPTS = "get-setting-opts",

  // Server return data
  ROLES = "roles",
  STATE = "state",
  SETTING_OPTS = "setting-opts",

  // Client Events
  CREATE_ROOM = "create-room",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  START_GAME = "start-game",
  CHANGE_SETTIING = "change-settings",
  SET_NAME = "set-name",
  ADD_ROLE = "add-role",
  REMOVE_ROLE = "remove-role",
  REMOVE_PLAYER = "remove-player",
  CHECK_ROOM = "check-room",

  // Server Events
  JOINED_ROOM = "joined-room",
  INVALID_ROOM = "invalid-room",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  SERVER_ERROR = "server-error",
  KICKED = "kicked",
  ROOM_FULL = "room-full",
  ROOM_JOINABLE = "room-joinable",
  GAME_IN_PROGRESS = "game-in-progress",

  // Umbrella event for in-game events
  GAME_EVENT = "game-event",
}

export interface GameMessageData {
  type: GameMessage;
  playerSelected: string;
  playerSelected2?: string;
  message?: any;
}

export enum GameMessage {
  // role turn indicators
  MAFIOSO_TURN = "mafioso_turn",
  INVESTIGATOR_TURN = "investigator-turn",
  DOCTOR_TURN = "doctor-turn",
  TRANSPORTER_TURN = "transporter-turn",
  END_TURN = "end-turn",

  // role actions
  KILL_VOTE = "kill_vote",
  UNDO_KILL_VOTE = "undo-kil-vote",
  HEAL = "heal",
  INVESTIGATE = "investigate",
  TRANSPORT = "transport",

  // phase
  NIGHT_PHASE = "night-phase",
  DISCUSSION_PHASE = "discussion-phase",
  VOTING_PHASE = "voting-phase",

  // end
  MAFIA_WIN = "mafia-win",
  TOWNS_WIN = "towns-win",
  JESTER_WIN = "jester-win",
}
