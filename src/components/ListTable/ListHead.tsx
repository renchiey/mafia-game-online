import { ReactNode } from "react";

interface ListHeadProps {
  children: ReactNode;
}

export function ListHead({ children }: ListHeadProps) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
}
