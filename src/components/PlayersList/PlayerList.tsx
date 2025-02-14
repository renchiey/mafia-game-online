import { Player } from "../../types";
import { ListTable } from "../ListTable/ListTable";
import { ListRow } from "../ListTable/ListRow";
import { ListHead } from "../ListTable/ListHead";
import { ListBody } from "../ListTable/ListBody";
import { ListHeadItem } from "../ListTable/ListHeadItem";
import { ListRowItem } from "../ListTable/ListRowItem";

interface PlayerListProps {
  players: Player[];
  hostId: string;
  playerId: string;
}

export function PlayerList({ players, hostId, playerId }: PlayerListProps) {
  return (
    <ListTable toggleBtnText="Players">
      <ListHead>
        <ListHeadItem>Players</ListHeadItem>
      </ListHead>
      <ListBody>
        {players.map((player, index) => (
          <ListRow key={player.clientId}>
            <ListRowItem>
              <span className="pr-2 font-semibold">{index + 1}</span>
              {player.username +
                (player.clientId === hostId ? " [host]" : "") +
                (player.clientId === playerId ? " (you)" : "")}
            </ListRowItem>
          </ListRow>
        ))}
      </ListBody>
    </ListTable>
  );
}
