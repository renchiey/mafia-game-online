import { useState } from "react";
import "./Landing.css";

export function Landing() {
  const [joinGameSelected, setJoinGameSelected] = useState(false);

  return (
    <div className="landing-container">
      <h1 className="landing-title">Mafia Online</h1>
      {!joinGameSelected ? (
        <>
          <button className="landing-button" onClick={() => setJoinGameSelected(true)}>
            join game
          </button>
          <button className="landing-button">create game</button>
          <button className="landing-button">Open Connection</button>
          <button className="landing-button">Close Connection</button>
        </>
      ) : (
        <>
          <h3 className="landing-game-code-header">Enter Game Code</h3>
          <input type="text" className="landing-game-code-text-field" placeholder="00000" maxLength={5} />
          <button className="landing-button">join</button>
          <button className="landing-button" onClick={() => setJoinGameSelected(false)}>
            back
          </button>
        </>
      )}
    </div>
  );
}
