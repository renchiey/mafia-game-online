import { useLocation } from "react-router";
import "./App.css";
import { Landing } from "./screens/Landing/Landing";
import { ReactNode, useEffect, useState } from "react";
import Game from "./screens/Game/Game";

function App() {
  let location = useLocation();
  const [screen, setScreen] = useState<ReactNode>(<Landing />);

  useEffect(() => {
    const searchParams = location.search.split("?");

    if (searchParams.length === 1) {
      setScreen(<Landing />);
    } else {
      setScreen(<Game gameCode={searchParams[1]} />);
    }
  }, [location]);

  return screen;
}

export default App;
