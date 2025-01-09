import { useEffect, useState } from "react";
import { GameAllegiance, GameRole } from "../../utils/types";
import { RoleItem } from "./RoleItem";
import { HiOutlinePlus } from "react-icons/hi";
import { Roles } from "../../utils/roles";

export function RolesList({}) {
  const [roleItems, setRoleItems] = useState<GameRole[]>([]);

  useEffect(() => {
    setRoleItems([
      Roles.mafia.mafioso,
      Roles.mafia.mafioso,
      Roles.towns.townie,
      Roles.towns.doctor,
    ]);
  }, []);

  return (
    <div className="lobby-roles-container">
      <h3>Roles</h3>
      <div className="lobby-roles-list">
        {roleItems.map((item) => (
          <RoleItem role={item} />
        ))}
      </div>
      <button className="lobby-roles-add-btn">
        <HiOutlinePlus size={25} />
      </button>
    </div>
  );
}
