import { Player, Role } from "../../types";
import { ListTable } from "../ListTable/ListTable";
import { ListRow } from "../ListTable/ListRow";
import { ListHead } from "../ListTable/ListHead";
import { ListBody } from "../ListTable/ListBody";
import { ListHeadItem } from "../ListTable/ListHeadItem";
import { ListRowItem } from "../ListTable/ListRowItem";

interface RoleListProps {
  roles: Role[];
}

export function RoleList({ roles }: RoleListProps) {
  return (
    <ListTable toggleBtnText="Roles">
      <ListHead>
        <ListHeadItem className=" font-semibold py-2">Role</ListHeadItem>
        <ListHeadItem className=" font-semibold">Team</ListHeadItem>
      </ListHead>
      <ListBody>
        {roles.map((role, index) => (
          <ListRow key={index}>
            <ListRowItem>
              <span className="pr-2 font-semibold">{index + 1}</span>
              {role.name}
            </ListRowItem>
            <ListRowItem>{role.allegiance.name}</ListRowItem>
          </ListRow>
        ))}
      </ListBody>
    </ListTable>
  );
}
