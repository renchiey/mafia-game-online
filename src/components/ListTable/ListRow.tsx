import { ReactNode } from "react";

interface ListRowProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function ListRow({ children, className, onClick }: ListRowProps) {
  return (
    <tr
      className={className ? className : "h-[16px] border-t  border-gray-300"}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
