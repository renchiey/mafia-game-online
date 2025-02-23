import { useEffect, useState } from "react";
import {
  AllegianceType,
  GamePhase,
  GameRole,
  Player,
  Role,
} from "../../../../shared/types";
import { PlayerItem } from "./PlayerItem";

interface GameBoardProps {
  players: Player[];
  playerId: string;
  gamePhase: GamePhase;
}

type Revealed = [string, string]; // [clientId, color]

export const GameBoard = ({ players, playerId, gamePhase }: GameBoardProps) => {
  const [role, setRole] = useState<Role>();

  const [revealed, setRevealed] = useState<Revealed[]>([]);
  const [playersTurn, setPlayersTurn] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player>();
  const [player1ToPerformActionOn, setPlayer1ToPerformActionOn] =
    useState<Player>();
  const [player2ToPerformActionOn, setPlayer2ToPerformActionOn] =
    useState<Player>();

  useEffect(() => {
    const player = players.find((p) => p.clientId === playerId) as Player;
    const tempRole = player.gameData?.role as Role;

    setRole(tempRole);

    const tempRevealed: Revealed[] = [[playerId, getColor(tempRole)]];

    if (tempRole.allegiance.name === AllegianceType.MAFIA) {
      players.forEach((player) => {
        if (
          player.clientId !== playerId &&
          player.gameData?.role.allegiance.name === AllegianceType.MAFIA
        ) {
          tempRevealed.push([player.clientId, getColor(tempRole)]);
        }
      });
    }
    setRevealed(tempRevealed);
  }, []);

  useEffect(() => {
    console.log(gamePhase);

    setSelectedPlayer(undefined);

    setPlayersTurn(false);

    switch (gamePhase) {
      case GamePhase.MAFIOSO_TURN:
        if (role?.name === GameRole.MAFIOSO) setPlayersTurn(true);
        break;
      case GamePhase.DOCTOR_TURN:
        if (role?.name === GameRole.DOCTOR) setPlayersTurn(true);
        break;
      case GamePhase.INVESTIGATOR_TURN:
        if (role?.name === GameRole.INVESTIGATOR) setPlayersTurn(true);
        break;
      case GamePhase.TRANSPORTER_TURN:
        if (role?.name === GameRole.TRANSPORTER) setPlayersTurn(true);
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

    if (
      !playersTurn ||
      player.clientId === playerId ||
      (role?.allegiance.name === AllegianceType.MAFIA &&
        player.gameData?.role.allegiance.name === AllegianceType.MAFIA)
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
        <span className={color}>{player.gameData?.role.name}</span>
        {">"}
      </p>
    );
  };

  const performAction = () => {
    if (!selectedPlayer) return;
  };

  return (
    <div className=" w-[80%] max-w-[680px] flex justify-center text-black text-xs sm:text-sm">
      <div className="flex flex-wrap bg-white justify-center rounded-2xl">
        {players.map((player) => (
          <PlayerItem
            player={player}
            playerId={playerId}
            currentPlayerRole={role}
            displayRole={displayRole}
            playersTurn={playersTurn}
            performAction={performAction}
            handlePlayerSelect={(p) => handlePlayerSelect(p)}
            selected={selectedPlayer?.clientId === player.clientId}
          />
        ))}
      </div>
    </div>
  );
};
