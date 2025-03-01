import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { MessageType, Player, Role, Settings } from "../../../shared/types";
import { WebSocketContext } from "../../contexts/WSContext";
import { PlayerList } from "../../components/PlayersList/PlayerList";
import { RoleList } from "../../components/RolesList/RoleList";
import SettingsWidget from "../../components/SettingsWidget/SettingsWidget";
import { Modal } from "../../components/Modal";
import { ChatWidget } from "../../components/ChatWidget/ChatWidget";

interface LobbyProps {
  players: Player[];
  roles: Role[];
  settings?: Settings;
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
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [showKickedModal, setShowKickedModal] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (playerId && hostId && playerId === hostId)
      send({ type: MessageType.GET_ROLES });
  }, [playerId, hostId]);

  useEffect(() => {
    subscribe(MessageType.ROLES, (data: Role[]) => setAvailableRoles(data));

    subscribe(MessageType.KICKED, () => setShowKickedModal(true));

    subscribe(MessageType.SERVER_ERROR, () => setShowKickedModal(true));

    subscribe(MessageType.CONNECTED, () => setShowKickedModal(true));

    return () => {
      unsubscribe(MessageType.ROLES);
      unsubscribe(MessageType.KICKED);
      unsubscribe(MessageType.SERVER_ERROR);
      unsubscribe(MessageType.CONNECTED);
      unsubscribe(MessageType.NOT_ENOUGH_PLAYERS);
      unsubscribe(MessageType.FILL_ROLE_POOL);
    };
  }, [subscribe, unsubscribe]);

  const handleCopyLink = () => {
    setCopyFeedback("Invite link copied!");

    navigator.clipboard
      .writeText(`${import.meta.env.VITE_URL}?${roomId}`)
      .then(() => setCopyFeedback("Invite link copied!"))
      .catch(() => setCopyFeedback("Failed to copy link."));

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

    copyTimeoutRef.current = setTimeout(() => {
      setCopyFeedback("");
      copyTimeoutRef.current = null;
    }, 2000);
  };

  const handleCloseModal = () => {
    window.location.href = import.meta.env.BASE_URL;
  };

  const handleStartGame = () => {
    send({
      type: MessageType.START_GAME,
      data: "",
    });
  };

  if (!settings) return null;

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
        <ChatWidget players={players} playerId={playerId} />
      </div>
      <SettingsWidget
        isHost={playerId.length > 0 && hostId.length > 0 && playerId === hostId}
        settings={settings}
        numPlayers={players.length}
        className="mt-5"
      />

      <div className="flex mt-10 mb-5 flex-col">
        <Button
          onClick={() => handleStartGame()}
          disabled={playerId !== hostId}
        >
          Start Game
        </Button>
      </div>
      <Modal show={showKickedModal} closeModal={() => handleCloseModal()}>
        <h2 className="text-lg font-semibold text-red-600">Disconnected</h2>
        <p className="text-gray-600 mt-2">You have been kicked from the room</p>
      </Modal>
    </div>
  );
}
