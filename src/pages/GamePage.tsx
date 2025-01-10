import { ReactNode, useEffect, useState } from "react";
import { RolesList } from "../components/lobby/RoleList";
import { PlayerList } from "../components/lobby/PlayerList";
import { useNavigate } from "react-router";
import { LeaveModal } from "../components/lobby/LeaveModal";

interface GameProps {
  gameCode: string;
}

export function GamePage({ gameCode }: GameProps) {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [state, setState] = useState<ReactNode>(<></>);

  // TEMPORARY
  const numPlayers = 5;

  useEffect(() => {
    if (gameStarted) {
      setState(<>poop</>);
    } else {
      setState(<Lobby gameCode={gameCode} onClickCallback={() => setGameStarted(true)} numPlayers={numPlayers} />);
    }
  }, [gameStarted]);

  return state;
}

interface LobbyProps {
  gameCode: string;
  onClickCallback: () => void;
  numPlayers: number;
}

const Lobby = ({ gameCode, onClickCallback, numPlayers }: LobbyProps) => {
  const [hintText, setHintText] = useState<string>("");
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  let navigate = useNavigate();

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
        <RolesList numPlayers={numPlayers} />
      </div>

      <div className="lobby-footer-container">
        <button className="lobby-btn" onClick={() => setShowLeaveModal(true)}>
          Leave Lobby
        </button>
        <button className="lobby-btn" onClick={onClickCallback}>
          Start Game
        </button>
        {showLeaveModal && <LeaveModal onLeave={() => navigate("/")} onCancel={() => setShowLeaveModal(false)} />}
      </div>
    </div>
  );
};
