import { FaAngleUp } from "react-icons/fa";

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  text: string;
}

export const ToggleButton = ({ isOpen, onClick, text }: ToggleButtonProps) => {
  return (
    <button
      className="md:hidden w-full p-2 rounded-xl relative font-semibold"
      onClick={onClick}
    >
      {text}
      <span
        className={`absolute right-2 transition-transform ${
          isOpen ? "rotate-0" : "rotate-180"
        }`}
      >
        <FaAngleUp size={24} />
      </span>
    </button>
  );
};
