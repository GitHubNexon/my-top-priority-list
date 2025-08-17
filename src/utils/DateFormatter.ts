// utils/dateFormatter.ts
export const formatDate = (iso: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.toLocaleDateString("en-US", { day: "2-digit" });
  const year = date.getFullYear();
  return `${weekday} ${month} ${day}, ${year}`;
};

export const formatTime = (iso: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDays = (days: string[]): string[] => {
  const orderedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return orderedDays.filter((day) => days.includes(day));
};