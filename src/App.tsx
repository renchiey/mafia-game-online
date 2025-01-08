import { useLocation } from "react-router";
import "./App.css";
import { LandingPage } from "./pages/LandingPage";
import { ReactNode, useEffect, useState } from "react";
import { GamePage } from "./pages/GamePage";

function App() {
  let location = useLocation();
  const [screen, setScreen] = useState<ReactNode>(<LandingPage />);

  useEffect(() => {
    const searchParams = location.search.split("?");
    console.log(searchParams);

    if (searchParams.length === 1) {
      setScreen(<LandingPage />);
    } else {
      setScreen(<GamePage gameCode={searchParams[1]} />);
    }
  }, [location]);

  return screen;
}

export default App;
