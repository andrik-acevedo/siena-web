// src/utils/date.ts
/** Returns YYYY-MM-DD in the user's *local* timezone (not UTC). */
export function localDateISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
