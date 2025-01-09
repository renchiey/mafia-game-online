import { ReactNode, useEffect, useState } from "react";
import { RolesList } from "../components/lobby/RoleList";
import { PlayerList } from "../components/lobby/PlayerList";

interface GameProps {
  gameCode: string;
}

export function GamePage({ gameCode }: GameProps) {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [state, setState] = useState<ReactNode>(<></>);

  useEffect(() => {
    if (gameStarted) {
      setState(<>poop</>);
    } else {
      setState(
        <Lobby
          gameCode={gameCode}
          onClickCallback={() => setGameStarted(true)}
        />
      );
    }
  }, [gameStarted]);

  return state;
}

interface LobbyProps {
  gameCode: string;
  onClickCallback: () => void;
}

const Lobby = ({ gameCode, onClickCallback }: LobbyProps) => {
  const [hintText, setHintText] = useState<string>("");

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);

    setHintText("Code copied to clipboard!");

    setTimeout(() => {
      setHintText("");
    }, 3000);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-game-code-container">
        <h1 className="lobby-game-code-display" onClick={() => copyCode()}>
          Game Code: {gameCode}
        </h1>
        <p className="lobby-game-code-hint">{hintText}</p>
      </div>
      <div className="lobby-main-container">
        <PlayerList />
        <RolesList />
      </div>

      <button onClick={onClickCallback}>Start Game</button>
    </div>
  );
};
