import { ReactNode } from "react";

interface ListBody {
  className?: string;
  children: ReactNode;
}

export function ListBody({ className, children }: ListBody) {
  return <tbody className={className ? className : ""}>{children}</tbody>;
}
