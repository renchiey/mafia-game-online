import { ReactNode, useEffect, useState } from "react";
import { RolesList } from "../components/lobby/RoleList";
import { PlayerList } from "../components/lobby/PlayerList";
import { useNavigate } from "react-router";
import { LeaveModal } from "../components/lobby/LeaveModal";
import { GameState, PlayerState } from "../utils/types";

interface GameProps {
  gameCode: string;
  player: PlayerState;
}

export function GamePage({ gameCode, player }: GameProps) {
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const { username } = player;

  // TEMPORARY
  const numPlayers = 5;

  console.log("Game page rendered");

  useEffect(() => {}, [gameStarted]);

  return gameStarted ? (
    <>POOP</>
  ) : (
    <Lobby
      gameCode={gameCode}
      onClickCallback={() => setGameStarted(true)}
      numPlayers={numPlayers}
      player={player}
    />
  );
}

interface LobbyProps {
  gameCode: string;
  onClickCallback: () => void;
  numPlayers: number;
  player: PlayerState;
}

const Lobby = ({
  gameCode,
  onClickCallback,
  numPlayers,
  player,
}: LobbyProps) => {
  const [hintText, setHintText] = useState<string>("");
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  console.log("Lobby rendered");

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
        <PlayerList players={[player]} />
        <RolesList numPlayers={numPlayers} />
      </div>

      <div className="lobby-footer-container">
        <button className="lobby-btn" onClick={() => setShowLeaveModal(true)}>
          Leave Lobby
        </button>
        <button className="lobby-btn" onClick={onClickCallback}>
          Start Game
        </button>
        {showLeaveModal && (
          <LeaveModal
            onLeave={() => navigate("/")}
            onCancel={() => setShowLeaveModal(false)}
          />
        )}
      </div>
    </div>
  );
};

interface GameProps {}

const Game = () => {
  const [currentState, setCurrentState] = useState<GameState>(GameState.Night);
  const [night, setNight] = useState<number>(0);

  /*
  Game loop:
    (CHECK WIN CONDITIONS)
      if only towns remain, towns win
      else if mafia outnumber towns, mafia win
      else if neutral roles have met their win condition, neutral wins 
  
      
    (NIGHT - each role has [host selected] seconds to use their role ability before it is the next roles turn)
      for each role with ability, use ability
      (role order: mafia > invest > doc > vet > trans)
    
    (DAY)
      show results of night activity.
      [host selected] seconds to discuss 

    (VOTING)
      players select who they want to vote out
  
  System Design:
    Websocket Server:
      - runs game loop, keeping track of game state
    
    Client (Game component): 
      - renders current state
*/

  useEffect(() => {}, []);

  return <></>;
};
