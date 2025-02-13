import { Landing } from "./views/landing";
import { Game } from "./views/game";
import { ReactNode, useEffect, useState } from "react";
import { Player } from "./types";
import { WebSocketProvider } from "./contexts/WSContext";

function App() {
  const [view, setView] = useState<ReactNode>(<Landing />);
  const [player, setPlayer] = useState<Player>({ username: "" });

  useEffect(() => {
    const searchParams = location.search.split("?");
    if (searchParams.length === 2) {
      const gameCode = searchParams[1];
    }
  }, []);

  const setLanding = () => {
    location.href = location.href.split("?")[0];
    setView(<Landing />);
  };

  return <WebSocketProvider>{view}</WebSocketProvider>;
}

export default App;
