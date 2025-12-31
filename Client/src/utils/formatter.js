import { format, parseISO } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "Not set";
  try {
    if (date instanceof Date) {
      return format(date, "dd MMM yyyy, hh:mm a");
    }
    if (typeof date === "string") {
      return format(parseISO(date), "dd MMM yyyy, hh:mm a");
    }
    return "Invalid date";
  } catch {
    return "Invalid date";
  }
};

export const formatDateShort = (date) => {
  if (!date) return "N/A";
  try {
    if (date instanceof Date) {
      return format(date, "dd MMM yyyy");
    }
    if (typeof date === "string") {
      return format(parseISO(date), "dd MMM yyyy");
    }
    return "N/A";
  } catch {
    return "N/A";
  }
};
