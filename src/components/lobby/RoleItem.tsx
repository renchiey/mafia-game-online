import { useEffect } from "react";

interface RoleItemProps {
  src: string | null;
  roleName: string | null;
}

export const RoleItem = ({ src = null, roleName = null }: RoleItemProps) => {
  return (
    <div className="role-item">
      {src && <img src={src} />}
      <h3 className="role-item-name">{roleName}</h3>
    </div>
  );
};
