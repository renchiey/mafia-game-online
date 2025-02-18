import { useContext, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../components/Button";
import { WebSocketContext } from "../../contexts/WSContext";
import { MessageType } from "../../../../shared/types";
import { changeURL } from "../../utils/helper";
import { PopupMessage } from "../../components/PopupMessage";
import { Modal } from "../../components/Modal";

interface LandingProps {
  roomId?: string;
}

export function Landing({ roomId }: LandingProps) {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [subscribe, unsubscribe, send, connected] =
    useContext<any>(WebSocketContext);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showReconnectPopup, setShowReconnectPopup] = useState(false);
  const [roomIsFull, setRoomIsFull] = useState(false);
  const [roomCodeIsValid, setRoomCodeIsValid] = useState(true);

  useEffect(() => {
    const data = roomId ? roomId : "no-room-id-provided";

    send({
      type: MessageType.CHECK_ROOM,
      data: data,
    });
  }, [roomId]);

  useEffect(() => {
    subscribe(MessageType.ROOM_FULL, () => setRoomIsFull(true));

    subscribe(MessageType.INVALID_ROOM, () => setRoomCodeIsValid(false));

    subscribe(MessageType.ROOM_JOINABLE, () => {
      setRoomIsFull(false);
      setRoomCodeIsValid(true);
    });

    return () => {
      unsubscribe(MessageType.INVALID_ROOM);
      unsubscribe(MessageType.ROOM_FULL);
    };
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    let timer: number | undefined;
    if (!connected) {
      setShowDisconnectModal(true);
    } else {
      setShowDisconnectModal(false);

      setShowReconnectPopup(true);
      timer = setTimeout(() => setShowReconnectPopup(false), 4000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [connected]);

  const handleJoinGame = () => {
    if (roomIsFull) {
      displayError("Room is full.");
      return;
    }
    if (!connected) {
      displayError("Not connected to server.");
      return;
    }
    if (!roomId) {
      displayError("No invite link provided.");
      return;
    }
    if (!roomCodeIsValid) {
      displayError("Invalid room code.");
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
      <div className="p-4">
        <Button onClick={handleJoinGame}>Join Game</Button>
      </div>
      <div className="p-4">
        <Button onClick={handleCreateGame}>Create Game</Button>
      </div>
      <div className=" h-[16px] text-red-500">{errorMessage}</div>

      <Modal
        show={showDisconnectModal}
        closeModal={() => setShowDisconnectModal(false)}
      >
        <h2 className="text-lg font-semibold text-red-600">Disconnected</h2>
        <p className="text-gray-600 mt-2">
          You have lost connection to the server.
        </p>
      </Modal>
      {showReconnectPopup && (
        <PopupMessage>
          <div className=" text-green-600 ">Connected to server.</div>
        </PopupMessage>
      )}
    </div>
  );
}
