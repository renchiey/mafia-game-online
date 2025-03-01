import { useContext, useEffect, useRef, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import {
  GameMessageType,
  GamePhase,
  MessageType,
  Player,
  Role,
  Room,
  Settings,
} from "../../../shared/types";
import { Lobby } from "../lobby";
import { ChatWidget } from "../../components/ChatWidget/ChatWidget";
import { GameBoard } from "../../components/GameBoard/GameBoard";
import { loadAudioFiles } from "../../utils/helper";
import { Button } from "../../components/Button";

export function Game() {
  const [subscribe, unsubscribe, send, connected] =
    useContext(WebSocketContext);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rolesPool, setRolesPool] = useState<Role[]>([]);
  const [settings, setSettings] = useState<Settings>();
  const [playerId, setPlayerId] = useState("");
  const [hostId, setHostId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [inGame, setInGame] = useState(false);
  const [audioMap, setAudioMap] = useState<Map<
    string,
    HTMLAudioElement
  > | null>(null);

  // in game state
  const [gamePhase, setGamePhase] = useState<GamePhase>();
  const [turnStarted, setTurnStarted] = useState(false);
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [votingStarted, setVotingStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [timer, setTimer] = useState(0);

  const turnTimeoutRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    // Get initial room data
    send({ type: MessageType.GET_STATE });

    const path = "/narrator_voicelines/";
    const audioPaths: Record<string, string> = {};

    // Pre-load audio files
    audioPaths[GamePhase.NIGHT] = `${path}${GamePhase.NIGHT}.mp3`;
    audioPaths[GamePhase.MAFIOSO_TURN] = `${path}${GamePhase.MAFIOSO_TURN}.mp3`;
    audioPaths[GamePhase.DOCTOR_TURN] = `${path}${GamePhase.DOCTOR_TURN}.mp3`;
    audioPaths[
      GamePhase.INVESTIGATOR_TURN
    ] = `${path}${GamePhase.INVESTIGATOR_TURN}.mp3`;
    audioPaths[
      GamePhase.TRANSPORTER_TURN
    ] = `${path}${GamePhase.TRANSPORTER_TURN}.mp3`;
    audioPaths[
      GamePhase.NIGHT_OUTCOME
    ] = `${path}${GamePhase.NIGHT_OUTCOME}.mp3`;
    audioPaths[GamePhase.DISCUSSION] = `${path}${GamePhase.DISCUSSION}.mp3`;
    audioPaths[GamePhase.VOTING] = `${path}${GamePhase.VOTING}.mp3`;
    audioPaths[GamePhase.MAFIA_WIN] = `${path}${GamePhase.MAFIA_WIN}.mp3`;
    audioPaths[GamePhase.TOWNS_WIN] = `${path}${GamePhase.TOWNS_WIN}.mp3`;
    audioPaths[GamePhase.JESTER_WIN] = `${path}${GamePhase.JESTER_WIN}.mp3`;
    audioPaths["turn_done"] = `${path}turn_done.mp3`;

    loadAudioFiles(audioPaths).then(setAudioMap).catch(console.error);
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
    console.log(gamePhase);
    if (inGame && gamePhase === GamePhase.BEGINNING) {
      setGameOver(false);
      goNextPhase();
      return;
    }
    if (!inGame || !gamePhase || !settings) return;

    if (
      gamePhase === GamePhase.MAFIOSO_TURN ||
      gamePhase === GamePhase.DOCTOR_TURN ||
      gamePhase === GamePhase.INVESTIGATOR_TURN ||
      gamePhase === GamePhase.TRANSPORTER_TURN
    )
      setTimer(Math.floor(20 * (1 / (settings?.turnSpeed as number))));
    else if (gamePhase === GamePhase.DISCUSSION)
      setTimer(settings?.discussionDuration as number);

    if (!audioMap) {
      handleError();
      return;
    }

    if (gamePhase === GamePhase.VOTING_OUTCOME) {
      handleEnded();
      return;
    }

    const audio = audioMap.get(gamePhase) as HTMLAudioElement;

    audioRef.current = audio;

    audio.addEventListener("ended", handleEnded);
    audio.play();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audio.removeEventListener("ended", handleEnded);
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

  const handleError = () => {
    console.log("error");
    setTimeout(() => handleEnded, 2000);
  };

  const handleEnded = () => {
    switch (gamePhase) {
      case GamePhase.MAFIOSO_TURN:
      case GamePhase.DOCTOR_TURN:
      case GamePhase.INVESTIGATOR_TURN:
      case GamePhase.TRANSPORTER_TURN:
        startTurn();
        break;
      case GamePhase.NIGHT_OUTCOME:
        setTimeout(() => goNextPhase(), 3500);
        break;
      case GamePhase.DISCUSSION:
        startDiscussion();
        break;
      case GamePhase.VOTING:
        startVoting();
        break;
      case GamePhase.VOTING_OUTCOME:
        setTimeout(() => goNextPhase(), 3500);
        break;
      case GamePhase.MAFIA_WIN:
      case GamePhase.TOWNS_WIN:
      case GamePhase.JESTER_WIN:
        setGameOver(true);
        break;
      default:
        goNextPhase();
    }
  };

  const startTurn = () => {
    setTurnStarted(true);

    turnTimeoutRef.current = setTimeout(() => {
      const audio = audioMap?.get("turn_done") as HTMLAudioElement;

      audioRef.current = audio;

      audio.addEventListener("ended", goNextPhase);

      audio.play();

      setTurnStarted(false);
    }, Math.floor(20 * (1 / (settings?.turnSpeed as number))) * 1000);
  };

  const startDiscussion = () => {
    setDiscussionStarted(true);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();

      setDiscussionStarted(false);
    }, (settings?.discussionDuration as number) * 1000);
  };

  const startVoting = () => {
    setVotingStarted(true);
    setTimer(10);

    turnTimeoutRef.current = setTimeout(() => {
      goNextPhase();

      setVotingStarted(false);
    }, 10000);
  };

  const goNextPhase = () => {
    send({
      type: MessageType.GAME_EVENT,
      data: {
        type: GameMessageType.END_TURN,
      },
    });
  };

  const skipPhase = () => {
    send({
      type: MessageType.GAME_EVENT,
      data: {
        type: GameMessageType.SKIP_PHASE,
      },
    });
  };

  const handleBackToLobby = () => {
    send({
      type: MessageType.GAME_EVENT,
      data: {
        type: GameMessageType.END_GAME,
      },
    });
  };

  const formatGamePhaseDisplay = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.BEGINNING:
        return "GAME STARTING";
      case GamePhase.NIGHT:
        return "NIGHT TIME";
      case GamePhase.MAFIOSO_TURN:
        return "MAFIA'S TURN";
      case GamePhase.DOCTOR_TURN:
        return "DOCTOR'S TURN";
      case GamePhase.INVESTIGATOR_TURN:
        return "INVESTIGATOR'S TURN";
      case GamePhase.TRANSPORTER_TURN:
        return "TRANSPORTER'S TURN";
      case GamePhase.NIGHT_OUTCOME:
        return "NIGHT OUTCOME";
      case GamePhase.DISCUSSION:
        return "DISCUSSION TIME";
      case GamePhase.VOTING:
        return "VOTING TIME";
      case GamePhase.VOTING_OUTCOME:
        return "VOTING OUTCOME";
      case GamePhase.MAFIA_WIN:
        return "MAFIA WIN";
      case GamePhase.TOWNS_WIN:
        return "TOWNS WIN";
      case GamePhase.JESTER_WIN:
        return "JESTER WINS";
      default:
        throw new Error(`${phase} does not have a display.`);
    }
  };

  return inGame && gamePhase && settings ? (
    <div className="flex flex-col mt-20">
      <div className="w-full py-5 flex flex-col justify-center items-center">
        <h2>{gamePhase && formatGamePhaseDisplay(gamePhase)}</h2>
        <h2>TIME REMAINING: {timer}</h2>
      </div>
      <div className="flex w-full h-full justify-center items-center flex-wrap gap-10">
        <GameBoard
          players={players}
          playerId={playerId}
          gamePhase={gamePhase}
          send={send}
          settings={settings}
        />
        <ChatWidget players={players} playerId={playerId} />
      </div>
      <div className="flex justify-center my-10">
        {gameOver ? (
          <Button onClick={handleBackToLobby}>Back to lobby</Button>
        ) : (
          <Button
            disabled={gamePhase && gamePhase !== GamePhase.DISCUSSION}
            onClick={skipPhase}
          >
            Skip Phase
          </Button>
        )}
      </div>
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
