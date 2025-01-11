export enum GameAllegiance {
  Mafia,
  Town,
  Neutral,
}

export enum PlayerStatus {
  Alive,
  Dead,
  Waiting,
}

export enum GameState {
  Night,
  Day,
  Voting,
  Finish,
}

export type GameRole = {
  name: string;
  allegiance: GameAllegiance;
  iconSrc: string;
  description: string;
};

export type PlayerState = {
  username: string;
  host: boolean;
  role: GameRole | null;
  status: PlayerStatus;
};
