import { ReactNode, useEffect, useState } from "react";
import { RoleItem } from "../components/lobby/RoleItem";

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
      setState(<Lobby gameCode={gameCode} onClickCallback={() => setGameStarted(true)} />);
    }
  }, [gameStarted]);

  return state;
}

interface LobbyProps {
  gameCode: string;
  onClickCallback: () => void;
}

// icons from: https://town-of-salem.fandom.com/wiki/Roles_(ToS)
const iconSrc = {
  mafia: "https://static.wikia.nocookie.net/town-of-salem/images/7/7e/RoleIcon_Ambusher.png",
  investigator: "https://static.wikia.nocookie.net/town-of-salem/images/6/6b/RoleIcon_Investigator.png",
  town: "https://static.wikia.nocookie.net/town-of-salem/images/4/4f/RoleIcon_Mayor.png",
  doctor: "https://static.wikia.nocookie.net/town-of-salem/images/0/07/RoleIcon_Doctor_1.png",
  veteran: "https://static.wikia.nocookie.net/town-of-salem/images/8/8a/RoleIcon_Veteran.png",
  transporter: "https://static.wikia.nocookie.net/town-of-salem/images/b/bb/RoleIcon_Transporter.png",
  jester: "https://static.wikia.nocookie.net/town-of-salem/images/d/d8/RoleIcon_Jester.png/",
};

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
        <div className="lobby-players-container">
          <h3>Players</h3>
          <ul className="lobby-players-list">
            <li>Player 1 (host)</li>
            <li>Player 2</li>
          </ul>
        </div>
        <div className="lobby-roles-container">
          <h3>Roles</h3>
          <div className="lobby-roles-list">
            <RoleItem src={iconSrc.mafia} roleName="mafia" />
            <RoleItem src={iconSrc.mafia} roleName="mafia" />
            <RoleItem src={iconSrc.town} roleName="town" />
          </div>
        </div>
      </div>

      <button onClick={onClickCallback}>Start Game</button>
    </div>
  );
};
