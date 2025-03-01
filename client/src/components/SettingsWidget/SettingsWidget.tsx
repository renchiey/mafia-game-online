import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { MessageType, Settings, SettingsOptions } from "../../../shared/types";
import { WebSocketContext } from "../../contexts/WSContext";
import { PopupMessage } from "../PopupMessage";

interface SettingsWidgetProps {
  isHost: boolean;
  settings: Settings;
  numPlayers: number;
  className?: string;
}

const SettingsWidget = ({
  isHost,
  settings,
  numPlayers,
  className,
}: SettingsWidgetProps) => {
  const [maxPlayersOpts, setMaxPlayersOpts] = useState<number[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(settings.maxPlayers);
  const [speedOpts, setSpeedOpts] = useState<number[]>([]);
  const [turnSpeed, setTurnSpeed] = useState<number>(settings.turnSpeed);
  const [discussionDuration, setDiscussionDuration] = useState<number>(
    settings.discussionDuration
  );
  const [revealRoleAfterDeath, setRevealRoleAfterDeath] = useState(false);
  const [narrator, setNarrator] = useState(false);
  const [veteranShots, setVeteranShots] = useState<number>(
    settings.veteranShots
  );

  const [settingsChanged, setSettingsChanged] = useState(false);
  const [popupMsg, setPopupMsg] = useState<ReactNode | null>(null);
  const timeoutRef = useRef<number>();

  const [subscribe, unsubscribe, send] = useContext(WebSocketContext);

  useEffect(() => {
    if (isHost) send({ type: MessageType.GET_SETTING_OPTS });
  }, [isHost]);

  useEffect(() => {
    resetSettings();
  }, [settings]);

  useEffect(() => {
    console.log(discussionDuration);
  }, [discussionDuration]);

  useEffect(() => {
    const channel = MessageType.SETTING_OPTS;
    subscribe(channel, (opts: SettingsOptions) => {
      setMaxPlayersOpts(opts.maxPlayers);
      setSpeedOpts(opts.roundSpeed);
    });
  }, [subscribe, unsubscribe]);

  const resetSettings = () => {
    setMaxPlayers(settings.maxPlayers);
    setTurnSpeed(settings.turnSpeed);
    setRevealRoleAfterDeath(settings.revealRoleAfterDeath);
    setNarrator(settings.narrator);
    setDiscussionDuration(settings.discussionDuration);
    setSettingsChanged(false);
  };

  const handleSave = () => {
    const settings: Settings = {
      maxPlayers,
      turnSpeed,
      revealRoleAfterDeath,
      discussionDuration,
      narrator,
      veteranShots,
    };

    if (isHost && settingsChanged) {
      if (maxPlayers < numPlayers) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setPopupMsg(
          <PopupMessage>
            <div className="text-red-600 font-semibold ">UNABLE TO SAVE</div>
            <div>Too many players in the lobby</div>
          </PopupMessage>
        );

        timeoutRef.current = setTimeout(() => setPopupMsg(null), 4000);
        resetSettings();
        return;
      }

      send({
        type: MessageType.CHANGE_SETTIING,
        data: settings,
      });
    }
  };

  const handleDiscussionDurationChange = (value: number) => {
    if (value > 500) setDiscussionDuration(500);
    else if (value < 30) setDiscussionDuration(30);
    else setDiscussionDuration(value);

    setSettingsChanged(true);
  };

  return (
    <div
      className={
        "w-full  md:max-w-md max-w-[280px] p-4 bg-stone-800 shadow-md rounded-2xl relative " +
        className
      }
    >
      {!isHost && (
        <div className=" h-full w-full bg-gray-500 absolute opacity-40 top-0 left-0 cursor-not-allowed rounded-2xl"></div>
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Game Settings</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Max Players</label>
          <select
            value={maxPlayers}
            onChange={(e) => {
              setMaxPlayers(Number(e.target.value));
              setSettingsChanged(true);
            }}
            className="w-full p-2 border rounded-lg"
          >
            {maxPlayersOpts.length > 0 ? (
              maxPlayersOpts.map((num) => (
                <option key={num} value={num} className=" text-black">
                  {num}
                </option>
              ))
            ) : (
              <option value={maxPlayers}>{maxPlayers}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Turn Duration
          </label>
          <select
            value={turnSpeed}
            onChange={(e) => {
              setTurnSpeed(Number(e.target.value));
              setSettingsChanged(true);
            }}
            className="w-full p-2 border rounded-lg"
          >
            {speedOpts.length > 0 ? (
              speedOpts.map((speed) => (
                <option key={speed} value={speed} className=" text-black">
                  {`${Math.floor(20 * (1 / speed))} seconds`}
                </option>
              ))
            ) : (
              <option value={turnSpeed}>{turnSpeed}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discussion Duration (seconds)
          </label>
          <input
            type="number"
            min={30}
            placeholder="In seconds"
            max={1000}
            value={discussionDuration}
            onChange={(e) =>
              handleDiscussionDurationChange(Number(e.target.value))
            }
            className=" border-white border p-2 rounded-lg w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reveal Role After Death</label>
          <input
            type="checkbox"
            checked={revealRoleAfterDeath}
            onChange={() => {
              setRevealRoleAfterDeath(!revealRoleAfterDeath);
              setSettingsChanged(true);
            }}
            className="w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Narrator</label>
          <input
            type="checkbox"
            checked={narrator}
            onChange={() => {
              setNarrator(!narrator);
              setSettingsChanged(true);
            }}
            className="w-5 h-5"
          />
        </div>
        <button
          onClick={handleSave}
          className={
            "w-full bg-blue-500 p-2 rounded-lg hover:bg-blue-600 active:bg-blue-600 transition" +
            (settingsChanged
              ? " cursor-pointer text-white"
              : " bg-blue-600 text-gray-200")
          }
        >
          {settingsChanged ? "Save Settings" : "Saved Settings"}
        </button>
      </div>
      {popupMsg}
    </div>
  );
};

export default SettingsWidget;
