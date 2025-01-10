import { useEffect, useState } from "react";
import { Player } from "./Player";

export function PlayerList() {
  const [playerList, setPlayerList] = useState<string[]>([]);

  useEffect(() => {
    setPlayerList(["player 1", "player 2", "player 3"]);
  }, []);

  return (
    <div className="lobby-players-container">
      <h3>Players</h3>
      <ul className="lobby-players-list">
        {playerList.map((player) => (
          <Player username={player} displaySettings={true} key={crypto.randomUUID()} />
        ))}
      </ul>
    </div>
  );
}
