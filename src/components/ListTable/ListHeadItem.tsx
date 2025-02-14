import { ReactNode } from "react";

interface ListHeadItemProps {
  children: ReactNode;
  className?: string;
  span?: number;
}

export function ListHeadItem({ children, className, span }: ListHeadItemProps) {
  return (
    <th
      colSpan={span}
      className={className ? className : "p-2 hidden md:block font-semibold "}
    >
      {children}
    </th>
  );
}
