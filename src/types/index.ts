import { WebSocket } from "ws";

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
  socket: WebSocket;
  username?: string;
  role?: string;
  allegiance?: number;
}

export interface Settings {
  maxPlayers: number;
  roundSpeed: number;
  roles: Role[];
}

export enum GamePhase {
  NIGHT = 0,
  DISCUSSION = 1,
  VOTING = 2,
}

export interface GameState {
  round: number;
  phase: GamePhase;
  dead: Player[];
}

export interface Room {
  roomId: string;
  creator: string;
  players: Player[];
  gameState: GameState;
  settings: Settings;
}

export interface Message {
  event: GameEvent;
  roomId: string;
  clientId: string;
  data: any;
}

export interface Client {
  ws: WebSocket;
  roomId?: string;
}

export enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  GUESS = "guess",
  CHANGE_SETTIING = "changeSettings",
  WORD_SELECT = "wordSelect",
  SET_NAME = "setName",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  GAME_ENDED = "gameEnded",
  DRAW_DATA = "drawData",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  WORD_CHOSEN = "wordChosen",
  SETTINGS_CHANGED = "settingsChanged",
  GUESS_FAIL = "guessFail",
  SERVER_ERR = "serverError",
}
