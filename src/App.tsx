import { Landing } from "./views/landing";
import { Game } from "./views/game";
import { ReactNode, useContext, useEffect, useState } from "react";
import { MessageType } from "./types";
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
    const channels = [MessageType.JOINED_ROOM, MessageType.INVALID_ROOM];

    subscribe(channels[0], () => {
      setView(<Game />);
    });

    subscribe(channels[1], (data: any) => {
      console.log(data);

      location.href = "http://localhost:5173/";
    });

    return () => {
      channels.forEach((channelName) => unsubscribe(channelName));
    };
  }, [subscribe, unsubscribe]);

  return view;
}

export default App;
