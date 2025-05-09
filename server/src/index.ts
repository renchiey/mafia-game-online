import express from "express";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Message, MessageType } from "./shared/types";
import {
  handleAddRole,
  handleChangeSettings,
  handleChatMessage,
  handleCheckRoom,
  handleClose,
  handleGameEvent,
  handleGet,
  handleJoinRoom,
  handleKickClient,
  handleLeaveRoom,
  handleRemoveRole,
  handleSetName,
  handleStartGame,
  onConnection,
  sendMessage,
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
      const msg: Message = JSON.parse(message);

      if (!msg.type) throw new Error("Invalid message received.");

      switch (msg.type) {
        case MessageType.SET_NAME:
          handleSetName(clientId, msg);
          break;
        case MessageType.JOIN_ROOM:
          handleJoinRoom(clientId, ws, msg);
          break;
        case MessageType.CREATE_ROOM:
          handleJoinRoom(clientId, ws, msg);
          break;
        case MessageType.CHECK_ROOM:
          handleCheckRoom(clientId, ws, msg);
          break;
        case MessageType.CHANGE_SETTIING:
          handleChangeSettings(clientId, msg);
          break;
        case MessageType.GET_STATE:
        case MessageType.GET_ROLES:
        case MessageType.GET_SETTING_OPTS:
          handleGet(clientId, ws, msg);
          break;
        case MessageType.ADD_ROLE:
          handleAddRole(clientId, msg);
          break;
        case MessageType.REMOVE_ROLE:
          handleRemoveRole(clientId, msg);
          break;
        case MessageType.LEAVE_ROOM:
          handleLeaveRoom(clientId);
          break;
        case MessageType.REMOVE_PLAYER:
          handleKickClient(msg);
          break;
        case MessageType.START_GAME:
          handleStartGame(clientId);
          break;
        case MessageType.GAME_EVENT:
          handleGameEvent(clientId, msg);
          break;
        case MessageType.CHAT_MESSAGE:
          handleChatMessage(clientId, msg);
          break;
        default:
          throw new Error(`Unknown event type: ${msg.type}`);
      }
    } catch (error) {
      sendMessage(ws, {
        type: MessageType.SERVER_ERROR,
        data: "",
      });
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => handleClose(clientId));
});
