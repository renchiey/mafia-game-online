import { useContext, useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { MessageType, Player, Role, Settings } from "../../types";
import { WebSocketContext } from "../../contexts/WSContext";
import { PlayerList } from "../../components/PlayersList/PlayerList";
import { RoleList } from "../../components/RolesList/RoleList";
import SettingsWidget from "../../components/SettingsWidget/SettingsWidget";

interface LobbyProps {
  players: Player[];
  roles: Role[];
  settings: Settings;
  hostId: string;
  playerId: string;
  roomId: string;
}

export function Lobby({
  players,
  roles,
  settings,
  hostId,
  playerId,
  roomId,
}: LobbyProps) {
  const [copyFeedback, setCopyFeedback] = useState("");
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (playerId && hostId && playerId === hostId)
      send({ type: MessageType.GET_ROLES });
  }, [playerId, hostId]);

  useEffect(() => {
    const channel = "roles";

    subscribe(channel, (data: Role[]) => {
      setAvailableRoles(data);
      console.log(data);
    });

    return () => unsubscribe(channel);
  }, [subscribe, unsubscribe]);

  const handleCopyLink = () => {
    setCopyFeedback("Invite link copied!");

    navigator.clipboard.writeText(`${import.meta.env.VITE_DEV_URL}?${roomId}`);

    setTimeout(() => {
      setCopyFeedback("");
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center md:h-full">
      <div className=" mb-10 mt-10">
        <Button onClick={handleCopyLink}>copy invite link</Button>
        <p className=" text-center h-[16px]">{copyFeedback}</p>
      </div>
      <div className=" flex w-full gap-5 md:gap-20  md:flex-row flex-col flex-wrap justify-center items-center">
        <PlayerList players={players} hostId={hostId} playerId={playerId} />
        <RoleList
          roles={roles}
          availableRoles={availableRoles}
          numPlayers={players.length}
          isHost={playerId === hostId}
        />
        <SettingsWidget
          isHost={
            playerId.length > 0 && hostId.length > 0 && playerId === hostId
          }
          settings={settings}
          numPlayers={players.length}
        />
      </div>

      <div className="flex mt-10">
        <Button
          className={
            " py-2 px-4 border-2 rounded-xl mb-5" +
            (playerId === hostId
              ? " border-white hover:bg-red-800 active:bg-red-800 cursor-pointer "
              : "border-gray-400 text-gray-400 cursor-not-allowed")
          }
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
