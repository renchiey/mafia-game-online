import {
  Allegiance,
  AllegianceType,
  GameRole,
  Role,
} from "../../../shared/types";

import {
  DoctorIcon,
  InvestigatorIcon,
  JesterIcon,
  MafiosoIcon,
  TownieIcon,
  TransportIcon,
  VeteranIcon,
} from "./icons";
import c from "../../../shared/colors";

export const TOWNS: Allegiance = {
  name: AllegianceType.TOWN,
  color: c.colors.towns,
};

export const MAFIA: Allegiance = {
  name: AllegianceType.MAFIA,
  color: c.colors.mafia,
};

export const NEUTRAL: Allegiance = {
  name: AllegianceType.NEUTRAL,
  color: c.colors.neutral,
};

export const ROLES: Role[] = [
  {
    name: GameRole.MAFIOSO,
    iconSrc: MafiosoIcon,
    allegiance: MAFIA,
    description:
      "Kill someone each night until no one can stand in the way of the Mafia.",
  },
  {
    name: GameRole.INVESTIGATOR,
    iconSrc: InvestigatorIcon,
    allegiance: TOWNS,
    description: "Investigate one person each night for a clue to their role.",
  },
  {
    name: GameRole.TOWNIE,
    iconSrc: TownieIcon,
    allegiance: TOWNS,
    description: "You are an innocent member of the Town.",
  },
  {
    name: GameRole.DOCTOR,
    iconSrc: DoctorIcon,
    allegiance: TOWNS,
    description: "Heal one person each night, preventing them from dying.",
  },
  {
    name: GameRole.TRANSPORTER,
    iconSrc: TransportIcon,
    allegiance: TOWNS,
    description: "Choose two people to transport at night.",
  },
  {
    name: GameRole.JESTER,
    iconSrc: JesterIcon,
    allegiance: NEUTRAL,
    description: "Trick the Town into voting against you.",
  },
];

// NOT YET IMPLEMENTED
// {
//   name: GameRole.VETERAN,
//   iconSrc: VeteranIcon,
//   allegiance: TOWNS,
//   description:
//     "Decide if you will go on alert on a certain night and kill anyone who visits you.",
// },
