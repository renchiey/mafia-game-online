import { ReactNode } from "react";

interface ListRowItemProps {
  className?: string;
  span?: number;
  onClick?: () => void;
  children: ReactNode;
}

export const ListRowItem = ({
  className,
  children,
  span,
  onClick,
}: ListRowItemProps) => {
  return (
    <td
      onClick={onClick}
      colSpan={span}
      className={className ? className : "p-2"}
    >
      {children}
    </td>
  );
};
