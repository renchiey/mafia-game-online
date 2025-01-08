import { useState } from "react";
import "./styles.css";
import JoinGame from "./Landing/JoinGame";
import CreateGame from "./Landing/CreateGame";

export function LandingPage() {
  const [joinGameSelected, setJoinGameSelected] = useState(false);
  const [createGameSelected, setCreateGameSelected] = useState(false);

  return (
    <div className="landing-container">
      <h1 className="landing-title">Mafia Online</h1>
      {!joinGameSelected && !createGameSelected && (
        <>
          <button className="landing-button" onClick={() => setJoinGameSelected(true)}>
            join game
          </button>
          <button className="landing-button" onClick={() => setCreateGameSelected(true)}>
            create game
          </button>
        </>
      )}
      {joinGameSelected && <JoinGame callback={() => setJoinGameSelected(false)} />}
      {createGameSelected && <CreateGame callback={() => setCreateGameSelected(false)} />}
    </div>
  );
}
