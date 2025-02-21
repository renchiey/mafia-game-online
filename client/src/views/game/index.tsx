import { useContext, useEffect, useRef, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import {
  GameMessage,
  GameMessageData,
  GamePhase,
  MessageType,
  Player,
  Role,
  Room,
  Settings,
} from "../../../../shared/types";
import { Lobby } from "../lobby";

export function Game() {
  const [subscribe, unsubscribe, send, connected] =
    useContext(WebSocketContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rolesPool, setRolesPool] = useState<Role[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [playerId, setPlayerId] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [gamePhase, setGamePhase] = useState<GamePhase>();
  const [inGame, setInGame] = useState(false);

  // Game over state
  const [gameOver, setGameOver] = useState(false);

  const [timer, setTimer] = useState(0);

  const timerIntervalRef = useRef<number>();
  const turnTimeoutRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    // Get initial room data
    send({ type: MessageType.GET_STATE });

    return () => clearTimeout(turnTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!connected) window.location.href = import.meta.env.BASE_URL;
  }, [connected]);

  useEffect(() => {
    subscribe(MessageType.STATE, (data: any) => {
      const { room, clientId }: { room: Room; clientId: string } = data;

      console.log("data", data);
      console.log(room);
      setPlayerId(clientId);
      setPlayers(room.players);
      setRolesPool(room.rolesPool);
      setSettings(room.settings);
      setHostId(room.host);
      setRoomId(room.roomId);
      setInGame(room.gameStarted);
      setGamePhase(room.gameState.gamePhase);
    });

    return () => unsubscribe(MessageType.STATE);
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    if (inGame && gamePhase === GamePhase.BEGINNING) {
      goNextPhase();
      return;
    }
    if (!inGame || !gamePhase) return;

    const audio = new Audio(`/narrator/${gamePhase}.mp3`);
    audioRef.current = audio;

    audio.addEventListener("ended", handleEnded);
    audio.play();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("ended", goNextPhase);
      }
    };
  }, [gamePhase, inGame]);

  const handleEnded = () => {
    if (
      gamePhase === GamePhase.MAFIOSO_TURN ||
      gamePhase === GamePhase.DOCTOR_TURN ||
      gamePhase === GamePhase.INVESTIGATOR_TURN ||
      gamePhase === GamePhase.TRANSPORTER_TURN
    ) {
      startTurn();
    } else if (gamePhase === GamePhase.DISCUSSION) {
      startDiscussion();
    } else if (gamePhase === GamePhase.VOTING) {
      startVoting();
    }
  };

  const startTurn = () => {
    setTimer(15);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);

    turnTimeoutRef.current = setTimeout(() => {
      clearInterval(timerIntervalRef.current);

      const audio = new Audio("/narrator/turn_done.mp3");

      audioRef.current = audio;

      audio.addEventListener("ended", goNextPhase);

      audio.play();
    }, 15000);
  };

  const startDiscussion = () => {
    setTimer(60);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();
    }, 60000);
  };

  const startVoting = () => {
    setTimer(10);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();
    }, 10000);
  };

  const goNextPhase = () => {
    send({
      type: MessageType.GAME_EVENT,
      data: {
        type: GameMessage.END_TURN,
      },
    });
  };

  return inGame ? (
    <div className="flex flex-col">
      <div>phase: {gamePhase}</div>
      <div>timer: {timer}</div>
    </div>
  ) : (
    <Lobby
      players={players}
      roles={rolesPool}
      settings={settings}
      hostId={hostId}
      playerId={playerId}
      roomId={roomId}
    ></Lobby>
  );
}
