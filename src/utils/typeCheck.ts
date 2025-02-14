import { Role } from "../types";

export function instanceOfRole(object: any): object is Role {
  return (
    object.name !== undefined &&
    object.iconSrc !== undefined &&
    object.allegiance !== undefined &&
    object.description !== undefined
  );
}
