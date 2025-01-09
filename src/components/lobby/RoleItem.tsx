import { HiOutlineX } from "react-icons/hi";
import { GameAllegiance, GameRole } from "../../utils/types";

interface RoleItemProps {
  role: GameRole;
}

export const RoleItem = ({ role }: RoleItemProps) => {
  const { iconSrc, name, description, allegiance } = role;

  const displayAllegiance = () => {
    switch (allegiance) {
      case GameAllegiance.Mafia:
        return <div className="role-item-allegiance role-mafia">Mafia</div>;
      case GameAllegiance.Town:
        return <div className="role-item-allegiance role-town">Town</div>;
      case GameAllegiance.Neutral:
        return <div className="role-item-allegiance role-neutral">Neutral</div>;
      default:
        return "";
    }
  };

  return (
    <div className="role-item">
      <div className="role-remove">
        <HiOutlineX size={20} color="red" />
      </div>
      <img src={iconSrc} />
      <h3 className="role-item-name">{name}</h3>
      {displayAllegiance()}
    </div>
  );
};
