import { MessageType, Player } from "../../../shared/types";
import { ListTable } from "../ListTable/ListTable";
import { ListRow } from "../ListTable/ListRow";
import { ListHead } from "../ListTable/ListHead";
import { ListBody } from "../ListTable/ListBody";
import { ListHeadItem } from "../ListTable/ListHeadItem";
import { ListRowItem } from "../ListTable/ListRowItem";
import { useContext, useRef, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import { IoCloseOutline } from "react-icons/io5";
import { Modal } from "../Modal";
import { Button } from "../Button";

interface PlayerListProps {
  players: Player[];
  hostId: string;
  playerId: string;
}

export const PlayerList = ({ players, hostId, playerId }: PlayerListProps) => {
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [rowShowRemove, setRowShowRemove] = useState<number | null>();
  const removeTimeoutRef = useRef<number | null>();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const handleRowClick = (index: number) => {
    if (playerId !== hostId) return;

    if (removeTimeoutRef.current) clearTimeout(removeTimeoutRef.current);

    setRowShowRemove(index);

    removeTimeoutRef.current = setTimeout(() => {
      setRowShowRemove(null);
      removeTimeoutRef.current = null;
    }, 5000);
  };

  const handleRemovePlayerClick = (clientId: string) => {
    if (!(playerId === hostId)) return;

    setSelectedPlayer(clientId);

    setShowRemoveModal(true);
  };

  const removePlayer = () => {
    if (!selectedPlayer) return;

    send({
      type: MessageType.REMOVE_PLAYER,
      data: selectedPlayer,
    });

    setSelectedPlayer("");

    setShowRemoveModal(false);
  };

  return (
    <>
      <ListTable toggleBtnText="Players">
        <ListHead>
          <ListHeadItem>Players</ListHeadItem>
        </ListHead>
        <ListBody>
          {players.map((player, index) => (
            <ListRow
              key={player.clientId}
              className="h-[16px] border-t border-gray-300 group relative"
              onClick={() => handleRowClick(index)}
            >
              <ListRowItem>
                <span className="pr-2 font-semibold">{index + 1}</span>
                {player.username +
                  (player.clientId === hostId ? " [host]" : "") +
                  (player.clientId === playerId ? " (you)" : "")}
              </ListRowItem>
              {player.clientId !== playerId && (
                <td
                  className={
                    "group-focus-within:block absolute right-3 bottom-0 top-0 mt-auto mb-auto h-5 w-5 cursor-pointer " +
                    (index == rowShowRemove && playerId === hostId
                      ? " block "
                      : "hidden ") +
                    (playerId === hostId && "group-hover:block")
                  }
                  onClick={() => handleRemovePlayerClick(player.clientId)}
                >
                  <IoCloseOutline size={20} />
                </td>
              )}
            </ListRow>
          ))}
        </ListBody>
      </ListTable>
      <Modal
        show={showRemoveModal}
        closeModal={() => setShowRemoveModal(false)}
      >
        <div className="font-semibold ">
          Are you sure you want to kick this player?
        </div>
        <Button
          onClick={() => removePlayer()}
          className="mt-4 px-5 py-1 rounded-2xl bg-blue-600 text-white active:bg-blue-400 hover:bg-blue-400 cursor-pointer"
        >
          Yes
        </Button>
      </Modal>
    </>
  );
};
