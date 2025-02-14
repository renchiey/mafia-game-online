import { useContext, useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { MessageType, Player, Role } from "../../types";
import { WebSocketContext } from "../../contexts/WSContext";
import { PlayerList } from "../../components/PlayersList/PlayerList";
import { RoleList } from "../../components/RolesList/RoleList";

interface LobbyProps {
  players: Player[];
  roles: Role[];
  hostId: string;
  playerId: string;
  roomId: string;
}

export function Lobby({
  players,
  roles,
  hostId,
  playerId,
  roomId,
}: LobbyProps) {
  const [copyFeedback, setCopyFeedback] = useState("");
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);

  const handleCopyLink = () => {
    setCopyFeedback("Invite link copied!");

    navigator.clipboard.writeText(`${import.meta.env.VITE_DEV_URL}?${roomId}`);

    setTimeout(() => {
      setCopyFeedback("");
    }, 2000);
  };

  return (
    <div className="flex flex-col justify-center items-center md:h-full">
      <div></div>
      <div className=" flex md:gap-10 md:flex-row flex-col">
        <PlayerList players={players} hostId={hostId} playerId={playerId} />
        <RoleList roles={roles} />
      </div>
      <div className="mt-10">
        <Button onClick={handleCopyLink}>invite link</Button>
        <p className=" text-center h-[16px]">{copyFeedback}</p>
      </div>
    </div>
  );
}
