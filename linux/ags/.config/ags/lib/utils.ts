import GLib from "gi://GLib?version=2.0";
import Gdk from "gi://Gdk";
import type Gtk from "gi://Gtk?version=3.0";
import type { Application } from "types/service/applications";
import { substitutes } from "./icons";

/**
 * @returns substitute icon || name || fallback icon
 */
export function icon(name: string | null, fallback = name) {
  if (!name) return fallback || "";

  if (GLib.file_test(name, GLib.FileTest.EXISTS)) return name;

  const icon = substitutes[name] || name;
  if (Utils.lookUpIcon(icon)) return icon;

  print(`no icon substitute "${icon}" for "${name}", fallback: "${fallback}"`);
  return fallback;
}

/**
 * @returns execAsync(["bash", "-c", cmd])
 */
export async function bash(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
) {
  const cmd =
    typeof strings === "string"
      ? strings
      : strings.flatMap((str, i) => `${str}${values[i] ?? ""}`).join("");

  return Utils.execAsync(["bash", "-c", cmd]).catch((err) => {
    console.error(cmd, err);
    return "";
  });
}

/**
 * @returns execAsync(cmd)
 */
export async function sh(cmd: string | string[]) {
  return Utils.execAsync(cmd).catch((err) => {
    console.error(typeof cmd === "string" ? cmd : cmd.join(" "), err);
    return "";
  });
}

export function forMonitors(widget: (monitor: number) => Gtk.Window) {
  const n = Gdk.Display.get_default()?.get_n_monitors() || 1;
  return range(n, 0).flatMap(widget);
}

/**
 * @returns [start...length]
 */
export function range(length: number, start = 1) {
  return Array.from({ length }, (_, i) => i + start);
}

/**
 * promisified timeout
 */
export function wait<T>(ms: number, callback: () => T): Promise<T> {
  return new Promise((resolve) =>
    Utils.timeout(ms, () => {
      resolve(callback());
    }),
  );
}

/**
 * @returns true if all of the `bins` are found
 */
export function dependencies(...bins: string[]) {
  const missing = bins.filter((bin) => {
    return !Utils.exec(`which ${bin}`);
  });

  if (missing.length > 0)
    console.warn("missing dependencies:", missing.join(", "));

  return missing.length === 0;
}

/**
 * run app detached
 */
export function launchApp(app: Application) {
  const exe = app.executable
    .split(/\s+/)
    .filter((str) => !str.startsWith("%") && !str.startsWith("@"))
    .join(" ");

  bash(`${exe} &`);
  app.frequency += 1;
}

/**
 * to use with drag and drop
 */
export function createSurfaceFromWidget(widget: Gtk.Widget) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cairo = imports.gi.cairo as any;
  const alloc = widget.get_allocation();
  const surface = new cairo.ImageSurface(
    cairo.Format.ARGB32,
    alloc.width,
    alloc.height,
  );
  const cr = new cairo.Context(surface);
  cr.setSourceRGBA(255, 255, 255, 0);
  cr.rectangle(0, 0, alloc.width, alloc.height);
  cr.fill();
  widget.draw(cr);
  return surface;
}

/**
 * @returns boolean
 */
export function isFileExists(url: string): boolean {
  // If the URL is a remote image, basically non local then return true
  // without checking anything
  if (url.startsWith("http://") || url.startsWith("https://")) return true;

  let fileUri = url as string | null;

  // If the URL is a file path, convert it to a URI
  if (!url.startsWith("file://")) {
    fileUri = GLib.filename_to_uri(url, null);
  }

  if (!fileUri) return false;

  // Extract the file path from the URI
  const [filePath, error] = GLib.filename_from_uri(fileUri);

  if (error || !filePath) {
    return false;
  }

  const exists = GLib.file_test(filePath, GLib.FileTest.EXISTS);
  const isRegular = GLib.file_test(filePath, GLib.FileTest.IS_REGULAR);

  return exists && isRegular;
}
