interface GameProps {
  gameCode: string;
}

export function GamePage({ gameCode }: GameProps) {
  return <div>HELLO {gameCode}</div>;
}
