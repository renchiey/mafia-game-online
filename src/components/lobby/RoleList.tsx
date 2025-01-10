import { useEffect, useState } from "react";
import { GameRole } from "../../utils/types";
import { RoleItem } from "./RoleItem";
import { HiOutlinePlus } from "react-icons/hi";
import { Roles } from "../../utils/roles";
import { RolesModal } from "./RolesModal";

interface RolesList {
  numPlayers: number;
}

export function RolesList({ numPlayers }: RolesList) {
  const [roleItems, setRoleItems] = useState<GameRole[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    setRoleItems([Roles.mafia.mafioso, Roles.mafia.mafioso, Roles.towns.townie, Roles.towns.doctor]);
  }, []);

  const addRole = (role: GameRole) => {
    return () => {
      setShowAddModal(false);
      // Sort roles alphabetically, then by allegiance
      setRoleItems((prev) =>
        [...prev, role]
          .sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          })
          .sort((a, b) => a.allegiance - b.allegiance)
      );
    };
  };

  const removeRole = (index: number) => {
    return () => setRoleItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="lobby-roles-container">
        <h3>Roles</h3>
        <div className="lobby-roles-list">
          {roleItems.map((item, index) => (
            <RoleItem role={item} onRemove={removeRole(index)} key={crypto.randomUUID()} />
          ))}
        </div>
        {roleItems.length < numPlayers && (
          <button className="lobby-roles-add-btn" onClick={() => setShowAddModal(true)}>
            <HiOutlinePlus size={25} />
          </button>
        )}
      </div>
      {showAddModal && <RolesModal addCallback={addRole} onClose={() => setShowAddModal(false)} />}
    </>
  );
}
