import { useState } from "react";

interface ButtonProps {
  children?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Button = ({
  children,
  onClick,
  className,
  disabled,
}: ButtonProps) => {
  const [btnDisabled, setBtnIsDisabled] = useState(
    disabled === undefined ? true : disabled
  );

  return (
    <button
      className={
        "text-lg font-medium " +
        (className ? className : "border-1 px-4 py-2 rounded-xl p-4 ") +
        (disabled
          ? " opacity-50 cursor-not-allowed"
          : " cursor-pointer hover:bg-blue-800 active:bg-blue-800")
      }
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
};
