import { ReactNode } from "react";

interface ListHeadProps {
  children: ReactNode;
}

export const ListHead = ({ children }: ListHeadProps) => {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};
