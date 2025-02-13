import { Player } from "../types";

interface PlayersListProps {
  players: Player[];
  hostId: string;
  playerId: string;
}

export function PlayersList({ players, hostId, playerId }: PlayersListProps) {
  return (
    <div className="p-4">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Players</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.clientId} className="text-center">
              <td className="border border-gray-300 p-2">{index + 1}</td>
              <td className="border border-gray-300 p-2">
                {player.username +
                  (player.clientId == hostId ? " [host]" : "") +
                  (player.clientId == playerId ? " (you)" : "")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
