import GObject from "gi://GObject";
import { type ConstructProps, Gtk, astalify } from "astal/gtk3";

export class ProgressBar extends astalify(Gtk.ProgressBar) {
  static {
    GObject.registerClass(ProgressBar);
  }

  constructor(
    props: ConstructProps<
      ProgressBar,
      Gtk.ProgressBar.ConstructorProps,
      Record<never, never>
    >,
  ) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    super(props as any);
  }
}
