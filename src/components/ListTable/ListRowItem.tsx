import { ReactNode } from "react";

interface ListRowItemProps {
  className?: string;
  children: ReactNode;
}

export function ListRowItem({ className, children }: ListRowItemProps) {
  return <td className={className ? className : "p-2"}>{children}</td>;
}
