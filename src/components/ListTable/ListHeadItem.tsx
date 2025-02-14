import { ReactNode } from "react";

interface ListHeadItemProps {
  children: ReactNode;
  className?: string;
}

export function ListHeadItem({ children, className }: ListHeadItemProps) {
  return (
    <th className={className ? className : "p-2 hidden md:block font-semibold"}>
      {children}
    </th>
  );
}
