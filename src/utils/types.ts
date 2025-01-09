export enum GameAllegiance {
  Mafia,
  Town,
  Neutral,
}

export type GameRole = {
  name: string;
  allegiance: GameAllegiance;
  iconSrc: string;
  description: string;
};
