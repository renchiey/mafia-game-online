import { useEffect, useState } from "react";
import { Player } from "./Player";
import { PlayerState, PlayerStatus } from "../../utils/types";

interface PlayerListProps {
  players: PlayerState[]; // TEMPORARY
}

export function PlayerList({ players }: PlayerListProps) {
  const [playerList, setPlayerList] = useState<PlayerState[]>([]);

  useEffect(() => {
    const p1: PlayerState = {
      username: "Andrew",
      host: false,
      status: PlayerStatus.Waiting,
      role: null,
    };

    const p2: PlayerState = {
      username: "Joseph",
      host: false,
      status: PlayerStatus.Waiting,
      role: null,
    };

    const p3: PlayerState = {
      username: "Chris",
      host: false,
      status: PlayerStatus.Waiting,
      role: null,
    };

    setPlayerList(
      [p1, p2, p3].concat(players).sort((a, b) => {
        if (a.host) {
          return -1;
        }
        if (b.host) {
          return 1;
        }
        return 0;
      })
    );
  }, []);

  return (
    <div className="lobby-players-container">
      <h3>Players</h3>
      <ul className="lobby-players-list">
        {playerList.map((player) => (
          <Player
            username={player.username}
            displaySettings={true}
            key={crypto.randomUUID()}
            host={player.host}
          />
        ))}
      </ul>
    </div>
  );
}
