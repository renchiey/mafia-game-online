import { WebSocket } from "ws";

export interface Client {
  ws: WebSocket;
  roomId?: string;
  roomRequested?: string;
}
