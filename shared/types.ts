export enum AllegianceType {
  MAFIA = "Mafia",
  TOWN = "Town",
  NEUTRAL = "Neutral",
}

export interface Allegiance {
  name: string;
  color: string;
}

export interface Role {
  name: GameRole;
  iconSrc: string;
  allegiance: Allegiance;
  description: string;
}

export interface Player {
  clientId: string;
  username?: string;
  gameData: {
    role?: Role;
    dead?: DeathType;
  };
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
  BEGINNING = "beginning",
  NIGHT = "night",
  MAFIOSO_TURN = "mafioso_turn",
  INVESTIGATOR_TURN = "investigator_turn",
  DOCTOR_TURN = "doctor_turn",
  TRANSPORTER_TURN = "transporter_turn",
  NIGHT_OUTCOME = "night_outcome",
  DISCUSSION = "discussion_time",
  VOTING = "voting_time",

  // Game over
  MAFIA_WIN = "mafia_win",
  TOWNS_WIN = "towns_win",
  JESTER_WIN = "jester_win",
}

export enum DeathType {
  LYNCHED = "lynched",
  KILLED = "killed",
}

export interface GameState {
  round: number;
  mafia: Player[];
  towns: Player[];
  neutrals: Player[];
  gamePhase: GamePhase;
  endTurn: number;
  actions: Actions;
  veteranShotsRemaining: number;
}

export interface Actions {
  killVoted?: Tuple[]; // [player voted to be killed, mafioso]
  healed?: Tuple[]; // [player to be healed, doctor]
  transported?: Tuple[]; // [[p1 to swap, p2 to swap], transporter]
  veteranActive?: string[]; // [veteran]
}

export type Tuple = [any, any];

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
  CHAT_MESSAGE = "chat-message",

  // Server Events
  CONNECTED = "connected",
  JOINED_ROOM = "joined-room",
  INVALID_ROOM = "invalid-room",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  SERVER_ERROR = "server-error",
  KICKED = "kicked",
  ROOM_FULL = "room-full",
  ROOM_JOINABLE = "room-joinable",
  GAME_IN_PROGRESS = "game-in-progress",
  FILL_ROLE_POOL = "fill-role-pool",
  NOT_ENOUGH_PLAYERS = "not-enough-players",

  // Umbrella event for in-game events
  GAME_EVENT = "game-event",
}

export interface GameMessageData {
  type: GameMessageType;
  playerSelected?: string;
  message?: any;
}

export enum GameMessageType {
  END_TURN = "end-turn",

  // role actions
  KILL_VOTE = "kill_vote",
  HEAL = "heal",
  INVESTIGATE = "investigate",
  TRANSPORT = "transport",
  GO_ALERT = "go-alert",

  // phase
  NIGHT_PHASE = "night-phase",
  DISCUSSION_PHASE = "discussion-phase",
  VOTING_PHASE = "voting-phase",

  // end
  MAFIA_WIN = "mafia-win",
  TOWNS_WIN = "towns-win",
  JESTER_WIN = "jester-win",
}

export enum GameRole {
  MAFIOSO = "Mafioso",
  DOCTOR = "Doctor",
  INVESTIGATOR = "Investigator",
  TRANSPORTER = "Transporter",
  TOWNIE = "Townie",
  VETERAN = "Veteran",
  JESTER = "Jester",
}

export type ChatMessage = {
  id: number;
  text: string;
  sender: string;
};
