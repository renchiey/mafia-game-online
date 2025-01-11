import { useState } from "react";
import { validateSessionId } from "../utils/helper";
import { useNavigate } from "react-router";
import { PlayerState, PlayerStatus } from "../utils/types";
enum LandingState {
  JOIN,
  CREATE,
  DEFAULT,
}

export function LandingPage() {
  const [state, setState] = useState<LandingState>(LandingState.DEFAULT);

  const currentState = () => {
    switch (state) {
      case LandingState.JOIN:
        return (
          <JoinGame returnCallback={() => setState(LandingState.DEFAULT)} />
        );
      case LandingState.CREATE:
        return (
          <CreateGame returnCallback={() => setState(LandingState.DEFAULT)} />
        );
      case LandingState.DEFAULT:
        return (
          <>
            <button
              className="landing-button"
              onClick={() => setState(LandingState.JOIN)}
            >
              join game
            </button>
            <button
              className="landing-button"
              onClick={() => setState(LandingState.CREATE)}
            >
              create game
            </button>
          </>
        );
      default:
        console.log("LANDING PAGE ERROR");
        return <></>;
    }
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Mafia Online</h1>
      {currentState()}
    </div>
  );
}

interface JoinGameProps {
  returnCallback: () => void;
}

const JoinGame = ({ returnCallback }: JoinGameProps) => {
  const [gameCode, setGameCode] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  const handleJoinClick = () => {
    if (!validateSessionId(gameCode)) {
      setFeedbackText("Please enter a valid game code.");

      setTimeout(() => {
        setFeedbackText("");
      }, 3000);
    }
  };

  return (
    <>
      <h3>Enter Game Code</h3>
      <input
        type="text"
        className="landing-gc-text-field"
        placeholder="00000"
        maxLength={5}
        onChange={(e) => setGameCode(e.target.value)}
      />
      <div className="landing-input-feedback">{feedbackText}</div>
      <button className="landing-button" onClick={() => handleJoinClick()}>
        join
      </button>
      <button className="landing-button" onClick={returnCallback}>
        Back
      </button>
    </>
  );
};

interface CreateGameProps {
  returnCallback: () => void;
}

const CreateGame = ({ returnCallback }: CreateGameProps) => {
  const [username, setUsername] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  let navigate = useNavigate();

  const tempID = "12345";

  const handleCreateClick = () => {
    if (username.length === 0) {
      setFeedbackText("Please enter a username first.");

      setTimeout(() => {
        setFeedbackText("");
      }, 3000);

      return;
    }
    navigate(`/?${tempID}`, { state: { id: tempID, player: username } });
  };

  return (
    <>
      <h3>Enter username</h3>
      <input
        type="text"
        className="landing-un-text-field"
        placeholder="name"
        maxLength={12}
        autoComplete="off"
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="landing-input-feedback">{feedbackText}</div>
      <button className="landing-button" onClick={() => handleCreateClick()}>
        Create
      </button>
      <button className="landing-button" onClick={returnCallback}>
        Back
      </button>
    </>
  );
};
