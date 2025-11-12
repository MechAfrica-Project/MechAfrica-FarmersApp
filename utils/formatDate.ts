// utils/formatDate.ts
export const formatDate = (dateTime?: string) => {
  if (!dateTime) return "N/A";
  const date = new Date(dateTime);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
