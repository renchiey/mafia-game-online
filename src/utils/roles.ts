import { GameAllegiance, GameRole } from "./types";

// icons from: https://town-of-salem.fandom.com/wiki/Roles_(ToS)
const iconSrc = {
  mafia:
    "https://static.wikia.nocookie.net/town-of-salem/images/7/7e/RoleIcon_Ambusher.png",
  investigator:
    "https://static.wikia.nocookie.net/town-of-salem/images/6/6b/RoleIcon_Investigator.png",
  town: "https://static.wikia.nocookie.net/town-of-salem/images/4/4f/RoleIcon_Mayor.png",
  doctor:
    "https://static.wikia.nocookie.net/town-of-salem/images/0/07/RoleIcon_Doctor_1.png",
  veteran:
    "https://static.wikia.nocookie.net/town-of-salem/images/8/8a/RoleIcon_Veteran.png",
  transporter:
    "https://static.wikia.nocookie.net/town-of-salem/images/b/bb/RoleIcon_Transporter.png",
  jester:
    "https://static.wikia.nocookie.net/town-of-salem/images/d/d8/RoleIcon_Jester.png/",
};

const Roles = {
  mafia: {
    mafioso: {
      name: "Mafioso",
      allegiance: GameAllegiance.Mafia,
      iconSrc: iconSrc.mafia,
      description:
        "Kill someone each night until no one can stand in the way of the Mafia.",
    },
  },
  towns: {
    investigator: {
      name: "Investigator",
      allegiance: GameAllegiance.Town,
      iconSrc: iconSrc.investigator,
      description:
        "Investigate one person each night for a clue to their role.",
    },
    townie: {
      name: "Townie",
      allegiance: GameAllegiance.Town,
      iconSrc: iconSrc.town,
      description: "You are an innocent member of the Town.",
    },
    doctor: {
      name: "Doctor",
      allegiance: GameAllegiance.Town,
      iconSrc: iconSrc.doctor,
      description: "Heal one person each night, preventing them from dying.",
    },
    veteran: {
      name: "Veteran",
      allegiance: GameAllegiance.Town,
      iconSrc: iconSrc.veteran,
      description:
        "Decide if you will go on alert on a certain night and kill anyone who visits you.",
    },
    transporter: {
      name: "Transporter",
      allegiance: GameAllegiance.Town,
      iconSrc: iconSrc.transporter,
      description: "Choose two people to transport at night.",
    },
  },
  neutral: {
    jester: {
      name: "Jester",
      allegiance: GameAllegiance.Neutral,
      iconSrc: iconSrc.jester,
      description: "Trick the Town into voting against you.",
    },
  },
};

export { Roles };
