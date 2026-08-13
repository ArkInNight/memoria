/** Current local time in the archive's storage format: `YYYY-MM-DD HH:MM:SS`. */
export function nowString(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Strip the fractional-seconds suffix used to keep multi-pull records ordered.
 * `2024-01-01 10:00:00.002` -> `2024-01-01 10:00:00`.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  return value.split(".")[0];
}

/** Only the calendar date portion: `2024-01-01 10:00:00` -> `2024-01-01`. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.split(" ")[0];
}

/** Pull-rate percentage with two decimals, e.g. `1.85` for 1.85%. */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatRate(count: number, total: number): string {
  return total > 0 ? ((count / total) * 100).toFixed(2) : "0";
}
