interface ButtonProps {
  children: string;
  onClick: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <div className="p-4">
      <button
        className="cursor-pointer text-lg font-medium border-1 px-4 py-2 rounded-xl"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
