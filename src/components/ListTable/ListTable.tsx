import { ReactNode, useState } from "react";
import { ToggleButton } from "./ToggleButton";

interface ListProps {
  children: ReactNode;
  toggleBtnText: string;
}

export function ListTable({ children, toggleBtnText }: ListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-xl bg-white text-black h-auto md:h-[540px] w-[280px]">
      <ToggleButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        text={toggleBtnText}
      />
      <div
        className={`overflow-hidden md:block ${isOpen ? "block" : "hidden"}`}
      >
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}
