import AstalBattery from "gi://AstalBattery";
import { Variable, bind } from "astal";
import { Attention, Tile, percentageToIconFromList } from "./utils.tsx";

const battery = AstalBattery.get_default();

const ICONS = {
  discharging: [
    "\u{f008e}",
    "\u{f007a}",
    "\u{f007b}",
    "\u{f007c}",
    "\u{f007d}",
    "\u{f007e}",
    "\u{f007f}",
    "\u{f0080}",
    "\u{f0081}",
    "\u{f0082}",
    "\u{f0079}",
  ],
  charging: [
    "\u{f089f}",
    "\u{f089c}",
    "\u{f0086}",
    "\u{f0087}",
    "\u{f0088}",
    "\u{f089d}",
    "\u{f0089}",
    "\u{f089e}",
    "\u{f008a}",
    "\u{f008b}",
    "\u{f0085}",
  ],
  full: "\u{f0084}",
  unknown: "\u{f0091}",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
});

export const Battery = () => {
  function getIcon(state: AstalBattery.State, percent: number) {
    if (state === AstalBattery.State.FULLY_CHARGED) {
      return ICONS.full;
    }
    if (state === AstalBattery.State.CHARGING) {
      return percentageToIconFromList(percent, ICONS.charging);
    }
    return percentageToIconFromList(percent, ICONS.discharging);
  }

  function getReadableTime(
    state: AstalBattery.State,
    secondsRemaining: number,
  ): string {
    if (state === AstalBattery.State.FULLY_CHARGED) {
      return "Plugged in";
    }
    if (secondsRemaining > 0) {
      if (secondsRemaining < 30 * 60) {
        const minutes = Math.ceil(secondsRemaining / 60);
        return `${minutes} min left`;
      }
      const timeToCompletion = new Date(Date.now() + secondsRemaining * 1000);
      const formatted = DATE_FORMAT.format(timeToCompletion).toLowerCase();
      if (state === AstalBattery.State.CHARGING) {
        return `Full at ${formatted}`;
      }
      return `Until ${formatted}`;
    }
    return "";
  }

  const tile = Variable.derive(
    [
      bind(battery, "is_present"),
      bind(battery, "state"),
      bind(battery, "percentage"),
      bind(battery, "time_to_empty"),
      bind(battery, "time_to_full"),
    ],
    (isPresent, state, percentage, timeToEmpty, timeToFull) => {
      const timeLeft =
        state === AstalBattery.State.CHARGING ? timeToFull : timeToEmpty;
      let attention = Attention.Normal;
      if (
        state === AstalBattery.State.DISCHARGING &&
        timeLeft > 0 &&
        percentage > 0
      ) {
        if (percentage <= 0.1 || timeLeft <= 1800) {
          attention = Attention.Alarm;
        } else if (percentage <= 0.2 || timeLeft <= 3600) {
          attention = Attention.Warning;
        }
      }

      return {
        icon: getIcon(state, percentage) || ICONS.unknown,
        primary:
          state === AstalBattery.State.FULLY_CHARGED
            ? "Full"
            : `${Math.round(percentage * 100)}%`,
        secondary: getReadableTime(state, timeLeft),
        visible: isPresent,
        attention,
      };
    },
  );

  return <Tile data={tile()} />;
};
