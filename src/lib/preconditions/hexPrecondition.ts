import { err, KaltsitError, ok, Result } from "kaltsit";

export function hexPrecondition(
  value: string,
): Result<`#${string}`, KaltsitError> {
  if (value.match(/^#[0-9A-Fa-f]{6}$/) === null) {
    return err(
      new KaltsitError("Invalid color. Please use a hex code like `#1A2B3C`."),
    );
  }

  return ok(value as `#${string}`);
}
