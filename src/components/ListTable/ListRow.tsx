import { ReactNode } from "react";

interface ListRowProps {
  className?: string;
  children: ReactNode;
}

export function ListRow({ children, className }: ListRowProps) {
  return (
    <tr className={className ? className : "h-[16px] border-t border-gray-300"}>
      {children}
    </tr>
  );
}
