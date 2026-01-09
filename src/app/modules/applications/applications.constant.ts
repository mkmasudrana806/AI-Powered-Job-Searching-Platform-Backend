export const APPLICATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  applied: ["reviewing", "rejected"],
  reviewing: ["shortlisted", "rejected"],
  shortlisted: ["hired"],
};
