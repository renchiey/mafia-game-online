import { useState } from "react";
import "./styles.css";
import { useNavigate } from "react-router";

interface CreateGameProps {
  callback: () => void;
}

export default function CreateGame({ callback }: CreateGameProps) {
  const [username, setUsername] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  let navigate = useNavigate();

  const handleCreateClick = () => {
    if (username.length === 0) {
      setFeedbackText("Please enter a username first.");

      setTimeout(() => {
        setFeedbackText("");
      }, 3000);

      return;
    }
    navigate(`/?${12345}`);
  };

  return (
    <>
      <h3>Enter username</h3>
      <input type="text" className="landing-un-text-field" placeholder="name" maxLength={12} autoComplete="off" onChange={(e) => setUsername(e.target.value)} />
      <div className="landing-input-feedback">{feedbackText}</div>
      <button className="landing-button" onClick={() => handleCreateClick()}>
        Create
      </button>
      <button className="landing-button" onClick={callback}>
        Back
      </button>
    </>
  );
}
