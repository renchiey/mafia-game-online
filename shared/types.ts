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
  phase: GamePhase;
  dead: Player[];
}

export interface Room {
  roomId: string;
  host: string;
  players: Player[];
  rolesPool: Role[];
  gameState: GameState;
  settings: Settings;
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
  GAME_STARTED = "game-started",
  GAME_ENDED = "game-ended",
  SERVER_ERROR = "server-error",
  KICKED = "kicked",
  ROOM_FULL = "room-full",
  ROOM_JOINABLE = "room-joinable",
}
