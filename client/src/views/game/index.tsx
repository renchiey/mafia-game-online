import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import {
  MessageType,
  Player,
  Role,
  Room,
  Settings,
} from "../../../../shared/types";
import { Lobby } from "../lobby";

export function Game() {
  const [subscribe, unsubscribe, send, connected] =
    useContext(WebSocketContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rolesPool, setRolesPool] = useState<Role[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [playerId, setPlayerId] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Get initial room data
    send({ type: MessageType.GET_STATE });
  }, []);

  useEffect(() => {
    if (!connected) window.location.href = import.meta.env.BASE_URL;
  }, [connected]);

  useEffect(() => {
    subscribe(MessageType.STATE, (data: any) => {
      const { room, clientId } = data;

      console.log("data", data);
      console.log(room);
      setPlayerId(clientId);
      setPlayers((room as Room).players);
      setRolesPool((room as Room).rolesPool);
      setSettings((room as Room).settings);
      setHostId((room as Room).host);
      setRoomId((room as Room).roomId);
    });

    return () => unsubscribe(MessageType.STATE);
  }, [subscribe, unsubscribe]);

  return (
    <Lobby
      players={players}
      roles={rolesPool}
      settings={settings}
      hostId={hostId}
      playerId={playerId}
      roomId={roomId}
    ></Lobby>
  );
}
