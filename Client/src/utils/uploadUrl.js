const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export const buildUploadUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const normalized = rawPath.trim();
  if (!normalized) return "";

  if (ABSOLUTE_URL_REGEX.test(normalized)) {
    return normalized;
  }

  const apiBase = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  const withoutLeadingSlash = normalized.replace(/^\/+/, "");
  const uploadRelativePath = withoutLeadingSlash.startsWith("uploads/")
    ? withoutLeadingSlash
    : `uploads/${withoutLeadingSlash}`;

  if (apiBase) {
    return `${apiBase}/${uploadRelativePath}`;
  }

  return `/${uploadRelativePath}`;
};
