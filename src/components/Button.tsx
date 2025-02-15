interface ButtonProps {
  children?: string;
  onClick?: () => void;
  className?: string;
}

export function Button({ children, onClick, className }: ButtonProps) {
  return (
    <button
      className={
        "text-lg font-medium " +
        (className
          ? className
          : "border-1 px-4 py-2 rounded-xl p-4 cursor-pointer hover:bg-blue-800 active:bg-blue-800")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
