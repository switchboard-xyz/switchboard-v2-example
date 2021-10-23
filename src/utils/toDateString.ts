export function toDateString(d: Date | undefined): string {
  if (d)
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  return "";
}
