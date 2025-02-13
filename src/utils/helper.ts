import { Message } from "../types";

export const validateSessionId = (sessionId: string) => {
  if (sessionId.length === 5) {
    let code, i, len;

    for (i = 0, len = sessionId.length; i < len; i++) {
      code = sessionId.charCodeAt(i);
      if (
        !(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123) // lower alpha (a-z)
      ) {
        return false;
      }
    }

    return true;
  }

  return false;
};

export function instanceOfMessage(object: any): object is Message {
  return object.type !== undefined && object.data !== undefined;
}
