import { SetStateAction } from "react";

export enum PlayerStatus {
  Alive,
  Dead,
  Waiting,
}

export enum GamePhase {
  NIGHT = 0,
  DISCUSSION = 1,
  VOTING = 2,
  COMPLETE = 3,
}

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
  username: string;
  role?: Role;
  status?: PlayerStatus;
}

export interface PlayerContext {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
}

export interface Room {}

export interface Message {
  type: MessageType;
  data: any;
}

export enum MessageType {
  // Client Events
  CREATE_ROOM = "create-room",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  START_GAME = "start-game",
  CHANGE_SETTIING = "change-settings",
  SET_NAME = "set-name",
  STATE_UPDATE = "state-update",

  // Server Events
  JOINED_ROOM = "joined-room",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  GAME_STARTED = "game-started",
  GAME_ENDED = "game-ended",
  SERVER_ERR = "server-error",
}

export interface ChannelInterface {
  [key: string]: (data: any) => void;
}
