import { useState } from "react";
import { validateSessionId } from "../../utils/helper";
import "./styles.css";

interface JoinGameProps {
  callback: () => void;
}

export default function JoinGame({ callback }: JoinGameProps) {
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
      <input type="text" className="landing-gc-text-field" placeholder="00000" maxLength={5} onChange={(e) => setGameCode(e.target.value)} />
      <div className="landing-input-feedback">{feedbackText}</div>
      <button className="landing-button" onClick={() => handleJoinClick()}>
        join
      </button>
      <button className="landing-button" onClick={callback}>
        back
      </button>
    </>
  );
}
