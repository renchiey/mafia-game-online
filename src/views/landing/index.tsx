import { useContext, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import { WebSocketContext } from "../../contexts/WSContext";
import { MessageType } from "../../types";
import { changeURL } from "../../utils/helper";
import { DisconnectedModal } from "../../components/DisconnectedModal";

interface LandingProps {
  roomId?: string;
}

export function Landing({ roomId }: LandingProps) {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [subscribe, unsubscribe, send, connected] =
    useContext<any>(WebSocketContext);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  useEffect(() => {
    const channel = MessageType.INVALID_ROOM;

    subscribe(channel, () => displayError("Invalid room code."));

    return () => {
      unsubscribe(channel);
    };
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    if (!connected) {
      setShowDisconnectModal(true);

      setTimeout(() => {
        setShowDisconnectModal(false);
      }, 5000);
    } else {
      setShowDisconnectModal(false);
    }
  }, [connected]);

  const handleJoinGame = () => {
    if (!connected) {
      displayError("Not connected to server.");
      return;
    }
    if (!roomId) {
      displayError("No invite link provided.");
      return;
    }

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
    if (!connected) {
      displayError("Not connected to server.");
      return;
    }

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

  const displayError = (msg: string) => {
    setErrorMessage(msg);

    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  return (
    <div className=" flex flex-col justify-center items-center h-full ">
      <TextInput setUsername={setUsername} />
      <Button onClick={handleJoinGame}>Join Game</Button>
      <Button onClick={handleCreateGame}>Create Game</Button>
      <div className=" h-[16px] text-red-500">{errorMessage}</div>

      <DisconnectedModal show={showDisconnectModal} />
    </div>
  );
}
