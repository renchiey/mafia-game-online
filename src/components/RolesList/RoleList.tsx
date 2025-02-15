import { MessageType, Role } from "../../types";
import { ListTable } from "../ListTable/ListTable";
import { ListRow } from "../ListTable/ListRow";
import { ListHead } from "../ListTable/ListHead";
import { ListBody } from "../ListTable/ListBody";
import { ListHeadItem } from "../ListTable/ListHeadItem";
import { ListRowItem } from "../ListTable/ListRowItem";
import { useContext, useEffect, useRef, useState } from "react";
import { WebSocketContext } from "../../contexts/WSContext";
import { IoCloseOutline } from "react-icons/io5";

interface RoleListProps {
  roles: Role[];
  numPlayers: number;
  availableRoles: Role[];
  isHost: boolean;
}

export function RoleList({
  roles,
  numPlayers,
  availableRoles,
  isHost,
}: RoleListProps) {
  const [showAddRole, setShowAddRole] = useState(false);
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [rowShowRemove, setRowShowRemove] = useState<number | null>();
  const timeoutRef = useRef<number | null>(null);

  const handleAddRole = (role: Role) => {
    send({
      type: MessageType.ADD_ROLE,
      data: role,
    });

    setShowAddRole(false);
  };

  const handleRowClick = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setRowShowRemove(index);

    timeoutRef.current = setTimeout(() => {
      setRowShowRemove(null);
    }, 5000);
  };

  const handleRemoveRole = (index: number) => {
    send({
      type: MessageType.REMOVE_ROLE,
      data: index,
    });
  };

  return (
    <ListTable toggleBtnText="Roles">
      <ListHead>
        {showAddRole ? (
          <ListHeadItem
            span={2}
            className=" font-semibold py-1 md:py-2 md:border-0 border-t border-gray-300"
          >
            Adding Role
          </ListHeadItem>
        ) : (
          <>
            <ListHeadItem className=" pl-12 text-start font-semibold py-1 md:py-2 md:border-b-1 md:border-0 border-t border-gray-300">
              Role
            </ListHeadItem>
            <ListHeadItem className=" pl-2 text-start  font-semibold md:border-b-1 md:border-0 border-t border-gray-300">
              Allegiance
            </ListHeadItem>
          </>
        )}
      </ListHead>
      <ListBody>
        {showAddRole ? (
          <>
            {availableRoles.map((role, index) => (
              <ListRow
                className="h-[16px] border-t border-gray-300 hover:bg-gray-300 cursor-pointer"
                onClick={() => handleAddRole(role)}
                key={index}
              >
                <ListRowItem>
                  <img
                    src={role.iconSrc}
                    className="w-7 mr-3 aspect-square inline"
                  />
                  {role.name}
                </ListRowItem>
                <ListRowItem className={role.allegiance.color}>
                  {role.allegiance.name}
                </ListRowItem>
              </ListRow>
            ))}
            <ListRow>
              <ListRowItem className="text-center p-2 col-span-2 " span={2}>
                <button
                  className="font-semibold cursor-pointer border-0 px-2 py-1 rounded-full bg-gray-300"
                  onClick={() => setShowAddRole(false)}
                >
                  Close
                </button>
              </ListRowItem>
            </ListRow>
          </>
        ) : (
          <>
            {roles.map((role, index) => (
              <ListRow
                className="h-[16px] border-t border-gray-300 group relative"
                key={index}
                onClick={() => handleRowClick(index)}
              >
                <ListRowItem>
                  <img
                    src={role.iconSrc}
                    className="w-7 mr-3 aspect-square inline"
                  />
                  {role.name}
                </ListRowItem>
                <ListRowItem className={` p-2 ${role.allegiance.color}`}>
                  {role.allegiance.name}
                </ListRowItem>
                <td
                  className={
                    "group-hover:block group-focus-within:block absolute right-3 bottom-0 top-0 mt-auto mb-auto h-5 w-5 cursor-pointer " +
                    (index == rowShowRemove ? " block" : "hidden")
                  }
                  onClick={() => handleRemoveRole(index)}
                >
                  <IoCloseOutline size={20} />
                </td>
              </ListRow>
            ))}
            {roles.length < numPlayers && isHost && (
              <ListRow>
                <ListRowItem className="text-center p-2 col-span-2 " span={2}>
                  <button
                    className="font-semibold cursor-pointer border-0 px-2 py-1 rounded-full bg-gray-300"
                    onClick={() => setShowAddRole(true)}
                  >
                    Add Role
                  </button>
                </ListRowItem>
              </ListRow>
            )}
          </>
        )}
      </ListBody>
    </ListTable>
  );
}
