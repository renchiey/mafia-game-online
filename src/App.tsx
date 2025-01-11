import { useLocation } from "react-router";
import "./App.css";
import { LandingPage } from "./pages/LandingPage";
import { ReactNode, useEffect, useState } from "react";
import { GamePage } from "./pages/GamePage";
import { PlayerState, PlayerStatus } from "./utils/types";

function App() {
  let location = useLocation();

  const [screen, setScreen] = useState<ReactNode>(<LandingPage />);

  useEffect(() => {
    const searchParams = location.search.split("?");

    if (searchParams.length === 1) {
      setScreen(<LandingPage />);
    } else {
      const { username } = location.state;

      // TEST PLAYER OBJECT
      const tempPlayer: PlayerState = {
        username: username,
        host: true,
        role: null,
        status: PlayerStatus.Waiting,
      };

      setScreen(<GamePage gameCode={searchParams[1]} player={tempPlayer} />);
    }
  }, [location]);

  return screen;
}

export default App;
