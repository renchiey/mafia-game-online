interface GameProps {
  gameCode: string;
}

export default function Game({ gameCode }: GameProps) {
  return <div>HELLO {gameCode}</div>;
}
