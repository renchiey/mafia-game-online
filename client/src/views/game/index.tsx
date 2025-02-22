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

  const [turnStarted, setTurnStarted] = useState(false);
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);

  // Game over state
  const [gameOver, setGameOver] = useState(false);

  const [timer, setTimer] = useState(0);

  const turnTimeoutRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    // Get initial room data
    send({ type: MessageType.GET_STATE });
  }, []);

  useEffect(() => {
    if (!connected) window.location.href = import.meta.env.BASE_URL;
  }, [connected]);

  useEffect(() => {
    subscribe(MessageType.STATE, (data: any) => {
      const { room, clientId }: { room: Room; clientId: string } = data;

      // console.log("data", data);
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

    if (
      gamePhase === GamePhase.MAFIOSO_TURN ||
      gamePhase === GamePhase.DOCTOR_TURN ||
      gamePhase === GamePhase.INVESTIGATOR_TURN ||
      gamePhase === GamePhase.TRANSPORTER_TURN
    )
      setTimer(15);
    else if (gamePhase === GamePhase.DISCUSSION) setTimer(60);

    const audio = new Audio(`/narrator/${gamePhase}.mp3`);
    audioRef.current = audio;

    audio.addEventListener("ended", handleEnded);
    audio.play();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("ended", goNextPhase);
      }
      clearTimeout(turnTimeoutRef.current);
    };
  }, [gamePhase, inGame]);

  useEffect(() => {
    if (!(votingStarted || discussionStarted || turnStarted)) return;

    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, votingStarted, discussionStarted, turnStarted]);

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
    } else {
      goNextPhase();
    }
  };

  const startTurn = () => {
    setTurnStarted(true);

    turnTimeoutRef.current = setTimeout(() => {
      const audio = new Audio("/narrator/turn_done.mp3");

      audioRef.current = audio;

      audio.addEventListener("ended", goNextPhase);

      audio.play();

      setTurnStarted(false);
    }, 15000);
  };

  const startDiscussion = () => {
    setDiscussionStarted(true);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();

      setDiscussionStarted(false);
    }, 60000);
  };

  const startVoting = () => {
    setVotingStarted(true);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();

      setVotingStarted(false);
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
