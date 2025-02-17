import { Role, Settings } from "../../../shared/types";

export function instanceOfRole(object: any): object is Role {
  return (
    object.name !== undefined &&
    object.iconSrc !== undefined &&
    object.allegiance !== undefined &&
    object.description !== undefined
  );
}

export function instanceOfSettings(object: any): object is Settings {
  return (
    object.maxPlayers !== undefined &&
    object.roundSpeed !== undefined &&
    object.revealRoleAfterDeath !== undefined &&
    object.narrator !== undefined
  );
}
