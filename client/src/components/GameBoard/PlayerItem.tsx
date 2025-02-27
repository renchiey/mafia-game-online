import { ReactNode, useEffect, useState } from "react";
import { GamePhase, GameRole, Player, Role } from "../../../../shared/types";

interface PlayerProps {
  player: Player;
  playerId: string;
  performAction: () => void;
  currentPlayerRole: Role | undefined;
  displayRole: (p: Player) => ReactNode;
  playersTurn: boolean;
  handlePlayerSelect: (p: Player | undefined) => void;
  selected: boolean;
  gamePhase: GamePhase;
}

/**
 *  TODO: Reduce number of props required to pass into this component
 */
export const PlayerItem = ({
  player,
  playerId,
  currentPlayerRole,
  performAction,
  displayRole,
  playersTurn,
  handlePlayerSelect,
  selected,
  gamePhase,
}: PlayerProps) => {
  const [actionButtonText, setActionButtonText] = useState(<></>);

  useEffect(() => {
    if (!currentPlayerRole) return;

    switch (currentPlayerRole.name) {
      case GameRole.MAFIOSO:
        setActionButtonText(<span className="text-red-700">VOTE KILL</span>);
        return;
      case GameRole.DOCTOR:
        setActionButtonText(<span className="text-green-700">HEAL</span>);
        return;
      case GameRole.INVESTIGATOR:
        setActionButtonText(<span className="text-blue-950">INVESTIGATE</span>);
        return;
      case GameRole.TRANSPORTER:
        setActionButtonText(<span className="text-black">SELECT</span>);
        return;
      default:
        break;
    }
  }, [currentPlayerRole]);

  useEffect(() => {
    if (gamePhase === GamePhase.VOTING) {
      setActionButtonText(<span className="text-black">VOTE</span>);
    }
  }, [gamePhase]);

  return (
    <div
      className={
        " m-2 w-[120px] relative md:w-[150px] aspect-square rounded-2xl shadow-xl   flex flex-col justify-center items-center" +
        (player.clientId === playerId
          ? " border-1 border-blue-500 "
          : " cursor-pointer ") +
        (player.gameData?.dead ? " bg-gray-300 " : " bg-white ")
      }
      onClick={
        !selected && playersTurn ? () => handlePlayerSelect(player) : undefined
      }
    >
      <h3>{player.username}</h3>
      {player.gameData?.dead ? (
        <p className="text-gray-500">dead</p>
      ) : (
        <p className="text-green-700">alive</p>
      )}
      {displayRole(player)}
      {selected && (
        <div
          onClick={() => handlePlayerSelect(undefined)}
          className="absolute w-full h-full z-10 backdrop-blur-xs flex justify-center items-center"
        >
          <div
            className=" px-3 py-2 bg-white rounded-xl border-1 border-gray-400"
            onClick={performAction}
          >
            {actionButtonText}
          </div>
        </div>
      )}
    </div>
  );
};
