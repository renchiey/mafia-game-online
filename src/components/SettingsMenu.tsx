import { useContext, useEffect, useRef, useState } from "react";
import { WebSocketContext } from "../contexts/WSContext";
import { MessageType, Settings, SettingsOptions } from "../types";

interface SettingsMenuProps {
  playerId?: string;
  hostId?: string;
  settings: Settings;
  isHost: boolean;
}

export function SettingsMenu({ isHost, settings }: SettingsMenuProps) {
  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);
  const [maxPlayerOpts, setMaxPlayerOpts] = useState<number[]>();
  const [roundSpeedOpts, setRoundSpeedOpts] = useState<number[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>();

  useEffect(() => {
    if (isHost) send({ type: MessageType.GET_SETTING_OPTS });
  }, [isHost]);

  useEffect(() => {
    setMaxPlayers(settings.maxPlayers);
  }, [settings]);

  useEffect(() => {
    const channel = subscribe(
      MessageType.SETTING_OPTS,
      (data: SettingsOptions) => {
        setMaxPlayerOpts(data.maxPlayers);
        setRoundSpeedOpts(data.roundSpeed);
      }
    );

    return () => unsubscribe(channel);
  }, [subscribe, unsubscribe]);

  const handleMaxPlayersChange = (val: any) => {
    setMaxPlayers(Number(val));
  };

  return (
    <div className="my-10 flex bg-stone-700 max-w-[680px]">
      <div>
        <label>Number of players:</label>
        <select
          defaultValue={settings.maxPlayers}
          value={maxPlayers}
          onChange={(e) => handleMaxPlayersChange(e.target.value)}
        >
          {maxPlayerOpts ? (
            maxPlayerOpts.map((val, index) => (
              <option value={val} key={index} className=" text-black">
                {val}
              </option>
            ))
          ) : (
            <option value={settings.maxPlayers} className=" text-black">
              {settings.maxPlayers}
            </option>
          )}
        </select>
      </div>
    </div>
  );
}
