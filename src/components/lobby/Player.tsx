import { HiCog } from "react-icons/hi";

interface PlayerProps {
  username: string;
  host?: boolean;
  displaySettings?: boolean;
}

export function Player({
  username,
  host = false,
  displaySettings = false,
}: PlayerProps) {
  return (
    <li className="player-list-item">
      {username}
      {displaySettings && (
        <button className="player-list-settings">
          <HiCog size={20} />
        </button>
      )}
    </li>
  );
}
