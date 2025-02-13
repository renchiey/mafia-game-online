import { useContext, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import { WebSocketContext } from "../../contexts/WSContext";
import { Message, MessageType } from "../../types";

export function Landing() {
  const [username, setUsername] = useState("");
  const [subscribe, unsubscribe, send] = useContext<any>(WebSocketContext);

  const handleJoinGame = () => {};

  const handleCreateGame = () => {
    const createGameMessage: Message = {
      type: MessageType.CREATE_ROOM,
      data: null,
    };

    const setUsernameMessage: Message = {
      type: MessageType.SET_NAME,
      data: username,
    };

    send(createGameMessage);
    send(setUsernameMessage);
  };

  return (
    <div>
      <h1 className="absolute text-4xl font-semibold w-screen text-center my-10">
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
