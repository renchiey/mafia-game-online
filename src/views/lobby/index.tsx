import { PlayersList } from "../../components/PlayersList";
import { Player } from "../../types";

interface LobbyProps {
  players: Player[];
  hostId: string;
  playerId: string;
}

export function Lobby({ players, hostId, playerId }: LobbyProps) {
  return (
    <div className=" flex justify-center items-center">
      <PlayersList players={players} hostId={hostId} playerId={playerId} />
    </div>
  );
}
