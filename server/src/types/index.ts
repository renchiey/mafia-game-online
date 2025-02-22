import { WebSocket } from "ws";

export interface Client {
  ws: WebSocket;
  username?: string;
  roomId?: string;
  roomRequested?: string;
}
