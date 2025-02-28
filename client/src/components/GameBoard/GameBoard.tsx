import { useEffect, useState } from "react";
import {
  AllegianceType,
  GameMessageData,
  GameMessageType,
  GamePhase,
  GameRole,
  Message,
  MessageType,
  Player,
  Role,
  Settings,
} from "../../../../shared/types";
import { PlayerItem } from "./PlayerItem";

interface GameBoardProps {
  players: Player[];
  playerId: string;
  gamePhase: GamePhase;
  send: (data: Message) => void;
  settings: Settings;
}

type Revealed = [string, string]; // [clientId, color]

export const GameBoard = ({
  players,
  playerId,
  gamePhase,
  send,
  settings,
}: GameBoardProps) => {
  const [role, setRole] = useState<Role>();

  const [revealed, setRevealed] = useState<Revealed[]>([]);
  const [playersTurn, setPlayersTurn] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();
  const [revealRoleOnDeath, setRevealRoleOnDeath] = useState(false);

  useEffect(() => {
    const player = players.find((p) => p.clientId === playerId) as Player;
    const tempRole = player.gameData?.role as Role;

    setRole(tempRole);

    const tempRevealed: Revealed[] = [[playerId, getColor(tempRole)]];

    if (tempRole.allegiance.name === AllegianceType.MAFIA) {
      players.forEach((player) => {
        if (
          player.clientId !== playerId &&
          player.gameData.role?.allegiance.name === AllegianceType.MAFIA
        ) {
          tempRevealed.push([player.clientId, getColor(tempRole)]);
        }
      });
    }
    setRevealed(tempRevealed);

    if (settings.revealRoleAfterDeath) setRevealRoleOnDeath(true);
  }, []);

  useEffect(() => {
    console.log(gamePhase);

    setSelectedPlayer(undefined);

    setPlayersTurn(false);

    let isDead = false;

    if ((players.find((p) => p.clientId === playerId) as Player).gameData.dead)
      isDead = true;

    switch (gamePhase) {
      case GamePhase.MAFIOSO_TURN:
        if (role?.name === GameRole.MAFIOSO && !isDead) setPlayersTurn(true);
        break;
      case GamePhase.DOCTOR_TURN:
        if (role?.name === GameRole.DOCTOR && !isDead) setPlayersTurn(true);
        break;
      case GamePhase.INVESTIGATOR_TURN:
        if (role?.name === GameRole.INVESTIGATOR && !isDead)
          setPlayersTurn(true);
        break;
      case GamePhase.TRANSPORTER_TURN:
        if (role?.name === GameRole.TRANSPORTER && !isDead)
          setPlayersTurn(true);
        break;
      case GamePhase.VOTING:
        if (!isDead) setPlayersTurn(true);
        break;
      case GamePhase.MAFIA_WIN:
      case GamePhase.TOWNS_WIN:
      case GamePhase.JESTER_WIN:
        const revealedPlayers: Revealed[] = [];

        players.forEach((player) => {
          revealedPlayers.push([
            player.clientId,
            getColor(player.gameData.role as Role),
          ]);
        });

        setRevealed(revealedPlayers);

        break;
      default:
        setPlayersTurn(false);
        break;
    }
  }, [gamePhase]);

  const handlePlayerSelect = (player: Player | undefined) => {
    if (!player) {
      setSelectedPlayer(player);
      return;
    }

    if (!playersTurn) return;

    if (
      (!playersTurn ||
        player.clientId === playerId ||
        (role?.allegiance.name === AllegianceType.MAFIA &&
          player.gameData.role?.allegiance.name === AllegianceType.MAFIA)) &&
      gamePhase !== GamePhase.VOTING
    )
      return;

    setSelectedPlayer(player);
  };

  const getColor = (role: Role) => {
    switch (role.allegiance.name) {
      case AllegianceType.MAFIA:
        return "text-red-600";
      case AllegianceType.TOWN:
        return "text-green-600";
      case AllegianceType.NEUTRAL:
        return "text-gray-600";
      default:
        return "";
    }
  };

  const displayRole = (player: Player) => {
    if (player.gameData.dead && revealRoleOnDeath) {
      return (
        <p>
          {"<"}
          <span className={getColor(player.gameData.role as Role)}>
            {player.gameData.role?.name}
          </span>
          {">"}
        </p>
      );
    }

    let color = "";
    const p = revealed.find((p) => {
      if (p[0] === player.clientId) {
        color = p[1];
      }
      return p[0] === player.clientId;
    });

    if (!p) return <p className="text-gray-400">{"<unknown>"}</p>;

    return (
      <p>
        {"<"}
        <span className={color}>{player.gameData.role?.name}</span>
        {">"}
      </p>
    );
  };

  const performAction = () => {
    if (!selectedPlayer) return;

    if (gamePhase === GamePhase.VOTING) {
      const vote: GameMessageData = {
        type: GameMessageType.VOTE_LYNCH,
        playerSelected: selectedPlayer.clientId,
      };

      send({
        type: MessageType.GAME_EVENT,
        data: vote,
      });

      return;
    }

    const action: GameMessageData = {
      type: GameMessageType.KILL_VOTE,
      playerSelected: selectedPlayer.clientId,
    };

    switch (role?.name) {
      case GameRole.MAFIOSO:
        action.type = GameMessageType.KILL_VOTE;
        break;
      case GameRole.DOCTOR:
        action.type = GameMessageType.HEAL;
        break;
      case GameRole.INVESTIGATOR:
        setPlayersTurn(false);
        action.type = GameMessageType.INVESTIGATE;
        break;
      case GameRole.TRANSPORTER:
        action.type = GameMessageType.TRANSPORT;
        break;
      default:
        throw new Error("ROLE HAS NO PERFORMABLE ACTION");
    }

    send({
      type: MessageType.GAME_EVENT,
      data: action,
    });
  };

  return (
    <div className=" w-[80%] max-w-[680px] flex justify-center text-black text-xs sm:text-sm">
      <div className="flex flex-wrap bg-white justify-center rounded-2xl">
        {players.map((player) => (
          <PlayerItem
            key={player.clientId}
            player={player}
            playerId={playerId}
            currentPlayerRole={role}
            displayRole={displayRole}
            playersTurn={playersTurn}
            performAction={performAction}
            handlePlayerSelect={(p) => handlePlayerSelect(p)}
            selected={selectedPlayer?.clientId === player.clientId}
            gamePhase={gamePhase}
          />
        ))}
      </div>
    </div>
  );
};
