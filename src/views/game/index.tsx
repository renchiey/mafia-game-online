import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import { MessageType, Player, Room } from "../../types";
import { Lobby } from "../lobby";

export function Game() {
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");

  useEffect(() => {
    // Get initial room data
    send({ type: MessageType.GET_UPDATE });
  }, []);

  useEffect(() => {
    const channelName = MessageType.STATE_UPDATE;

    subscribe(channelName, (data: any) => {
      const { roomData, clientId } = data;

      console.log(data);
      setPlayerId(clientId);
      setPlayers((roomData as Room).players);
      setHostId((roomData as Room).host);
    });
  }, [subscribe, unsubscribe]);

  return <Lobby players={players} hostId={hostId} playerId={playerId}></Lobby>;
}
