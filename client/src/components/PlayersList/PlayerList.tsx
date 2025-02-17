import { MessageType, Player } from "../../types";
import { ListTable } from "../ListTable/ListTable";
import { ListRow } from "../ListTable/ListRow";
import { ListHead } from "../ListTable/ListHead";
import { ListBody } from "../ListTable/ListBody";
import { ListHeadItem } from "../ListTable/ListHeadItem";
import { ListRowItem } from "../ListTable/ListRowItem";
import { useContext, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import { IoCloseOutline } from "react-icons/io5";

interface PlayerListProps {
  players: Player[];
  hostId: string;
  playerId: string;
}

export const PlayerList = ({ players, hostId, playerId }: PlayerListProps) => {
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [rowShowRemove, setRowShowRemove] = useState<number | null>();

  const handleRemovePlayer = (clientId: string) => {
    if (!(playerId === hostId)) return;

    send({
      type: MessageType.REMOVE_PLAYER,
      data: clientId,
    });
  };

  return (
    <ListTable toggleBtnText="Players">
      <ListHead>
        <ListHeadItem>Players</ListHeadItem>
      </ListHead>
      <ListBody>
        {players.map((player, index) => (
          <ListRow
            key={player.clientId}
            className="h-[16px] border-t border-gray-300 group relative"
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
                onClick={() => handleRemovePlayer(player.clientId)}
              >
                <IoCloseOutline size={20} />
              </td>
            )}
          </ListRow>
        ))}
      </ListBody>
    </ListTable>
  );
};
