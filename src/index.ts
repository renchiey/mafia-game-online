import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Message, MessageType } from "./types";
import {
  handleAddRole,
  handleClose,
  handleJoinRoom,
  handleLeaveRoom,
  handleSendRoles,
  handleSendUpdate,
  handleSetName,
  onConnection,
} from "./handlers/socketHandlers";

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

      if (!data.type) throw new Error("Invalid message received.");

      console.log(
        `[CLIENT MSG]: client ${clientId} sent a message of type: ${data.type}`
      );

      switch (data.type) {
        case MessageType.SET_NAME:
          handleSetName(clientId, data);
          break;
        case MessageType.JOIN_ROOM:
          if (!data.data) throw new Error("No roomId provided.");
          handleJoinRoom(clientId, ws, data);
          break;
        case MessageType.CREATE_ROOM:
          handleJoinRoom(clientId, ws, data);
          break;
        case MessageType.GET_STATE:
          handleSendUpdate(clientId, ws);
          break;
        case MessageType.GET_ROLES:
          handleSendRoles(clientId, ws);
          break;
        case MessageType.ADD_ROLE:
          handleAddRole(clientId, ws, data);
          break;
        case MessageType.LEAVE_ROOM:
          handleLeaveRoom(clientId);
          break;
        default:
          throw new Error(`Unknown event type: ${data.type}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => handleClose(clientId));
});
