import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Message, Player, GameEvent } from "./types";
import { handleClose, handleJoinRoom, handleLeaveRoom, handleSetName, onConnection } from "./handlers/socketHandlers";

const PORT = 8080;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const clientId = uuidv4();

  onConnection(clientId, ws);

  ws.on("message", (message: string) => {
    try {
      const data: Message = JSON.parse(message);

      if (!data.event || !data.clientId) {
        throw new Error("Invalid message received.");
      }

      switch (data.event) {
        case GameEvent.SET_NAME:
          handleSetName(data);
          break;
        case GameEvent.CREATE_ROOM:
        case GameEvent.JOIN_ROOM:
          handleJoinRoom(ws, data);
          break;
        case GameEvent.LEAVE_ROOM:
          handleLeaveRoom(data);
          break;
        default:
          throw new Error(`Unknown event type: ${data.event}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ event: GameEvent.SERVER_ERR, message: error }));
    }
  });

  ws.on("close", () => handleClose(clientId));
});
