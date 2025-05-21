import { App, type Gdk, type Gtk } from "astal/gtk4";
import style from "./style.scss";
import { Bar } from "./widget/bar.tsx";
import {
  NotificationMap,
  NotificationPopups,
} from "./widget/notifications/notifications.tsx";

function main() {
  const monitors = App.get_monitors();

  // show notifications on last monitor
  NotificationPopups(monitors[monitors.length - 1]);

  // initialize all monitors with a bar
  const bars = new Map<Gdk.Monitor, Gtk.Widget>();
  for (const m of monitors) {
    bars.set(m, Bar(m));
  }

  // add new bars when monitors are connected
  App.connect("monitor-added", (_, m) => bars.set(m, Bar(m)));

  // remove bars when monitors are disconnected
  App.connect("monitor-removed", (_, m) => bars.delete(m));
}

// this runs in the main instance
function requestHandler(request: string, res: (response: unknown) => void) {
  if (request === "noti-act") {
    NotificationMap.get_default().activateTopNotification();
    res("done");
  }
}

function client(message: (msg: string) => string, ...args: string[]): void {
  if (args[0] === "noti" && args[1] === "act") {
    message("noti-act");
  }
}

App.start({
  css: style,
  instanceName: "muse-shell",

  // functions
  main,
  requestHandler,
  client,
});
