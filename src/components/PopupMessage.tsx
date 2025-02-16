import { ReactNode } from "react";

interface PopupMessageProps {
  children?: ReactNode;
  className?: string;
}

export const PopupMessage = ({ children, className }: PopupMessageProps) => {
  return (
    <div
      className={
        "fixed bg-white rounded-2xl bottom-4 right-4 mb-5 mr-5 shadow-lg px-4 py-2 text-black " +
        className
      }
    >
      {children}
    </div>
  );
};
