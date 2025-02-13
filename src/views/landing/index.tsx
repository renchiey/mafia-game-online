import { useContext, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import { WebSocketContext } from "../../contexts/WSContext";
import { Message, MessageType } from "../../types";
import { changeURL } from "../../utils/helper";

interface LandingProps {
  roomId?: string;
}

export function Landing({ roomId }: LandingProps) {
  const [username, setUsername] = useState("");
  const [subscribe, unsubscribe, send] = useContext<any>(WebSocketContext);

  const handleJoinGame = () => {
    send({
      type: MessageType.JOIN_ROOM,
      data: roomId,
    });
    send({
      type: MessageType.SET_NAME,
      data: username,
    });
  };

  const handleCreateGame = () => {
    send({
      type: MessageType.CREATE_ROOM,
      data: null,
    });
    send({
      type: MessageType.SET_NAME,
      data: username,
    });

    changeURL("/");
  };

  return (
    <div>
      <h1
        className="absolute text-4xl font-semibold w-screen text-center my-10"
        onClick={() => (window.location.href = import.meta.env.BASE_URL)}
      >
        Mafia Online
      </h1>
      <div className=" flex flex-col justify-center items-center h-screen">
        <TextInput setUsername={setUsername} />
        <Button onClick={handleJoinGame}>Join Game</Button>
        <Button onClick={handleCreateGame}>Create Game</Button>
      </div>
    </div>
  );
}
