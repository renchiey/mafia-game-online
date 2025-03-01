import { Landing } from "./views/landing";
import { Game } from "./views/game";
import { ReactNode, useContext, useEffect, useState } from "react";
import { MessageType } from "../shared/types";
import { WebSocketContext } from "./contexts/WSContext";

function App() {
  const [view, setView] = useState<ReactNode>(<Landing />);
  const [subscribe, unsubscribe] = useContext(WebSocketContext);

  useEffect(() => {
    const searchParams = location.search.split("?");
    if (searchParams.length === 2) {
      setView(<Landing roomId={searchParams[1]} />);
    }
  }, []);

  useEffect(() => {
    const channel = MessageType.JOINED_ROOM;

    subscribe(channel, () => {
      setView(<Game />);
    });

    return () => {
      unsubscribe(channel);
    };
  }, [subscribe, unsubscribe]);

  return (
    <div className="h-screen flex flex-col ">
      <div className=" w-full py-10 flex justify-center">
        <div
          className="text-4xl font-semibold cursor-pointer"
          onClick={() => (window.location.href = import.meta.env.BASE_URL)}
        >
          Mafia IRL Online
        </div>
      </div>
      {view}
    </div>
  );
}

export default App;
