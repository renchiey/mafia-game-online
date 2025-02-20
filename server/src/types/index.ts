import { WebSocket } from "ws";

export interface Client {
  ws: WebSocket;
  roomId?: string;
  roomRequested?: string;
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

  // Server Events
  JOINED_ROOM = "joined-room",
  INVALID_ROOM = "invalid-room",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  GAME_STARTED = "game-started",
  GAME_ENDED = "game-ended",
  SERVER_ERROR = "server-error",
  KICKED = "kicked",
}
