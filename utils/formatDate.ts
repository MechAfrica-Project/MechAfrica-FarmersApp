// utils/formatDate.ts
export const formatDate = (dateTime?: string) => {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  // If date is invalid or is the UNIX epoch (timestamp === 0), treat as missing
  if (isNaN(date.getTime()) || date.getTime() === 0) return "N/A";
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
