import { Message } from "../../shared/types";

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

export function changeURL(newPath: string) {
  history.pushState({}, "", newPath);
}

export const loadAudioFiles = async (
  fileMap: Record<string, string>
): Promise<Map<string, HTMLAudioElement>> => {
  const audioMap = new Map<string, HTMLAudioElement>();

  const audioPromises = Object.entries(fileMap).map(([key, path]) => {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio(path);
      audio.addEventListener(
        "canplaythrough",
        () => {
          audioMap.set(key, audio);
          resolve();
        },
        { once: true }
      );
      audio.addEventListener(
        "error",
        () => reject(new Error(`Failed to load: ${path}`)),
        { once: true }
      );
    });
  });

  await Promise.all(audioPromises);
  return audioMap;
};
