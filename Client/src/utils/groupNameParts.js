/** Split stored full name into First / Middle / Last (by words). */
export function splitGroupHeadName(full = "") {
  const s = String(full).trim();
  if (!s) return { first: "", middle: "", last: "" };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  };
}

export function joinGroupHeadName({ first = "", middle = "", last = "" } = {}) {
  return [first, middle, last]
    .map((x) => String(x ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/** UI-only fields removed; `groupHeadName` and `groupName` both set to the same full name. */
export function sanitizePersonalDetailsGroupHead(formData) {
  if (!formData || typeof formData !== "object") return formData;
  const {
    groupHeadNameFirst,
    groupHeadNameMiddle,
    groupHeadNameLast,
    ...rest
  } = formData;
  const hasParts =
    groupHeadNameFirst !== undefined ||
    groupHeadNameMiddle !== undefined ||
    groupHeadNameLast !== undefined;

  let merged;
  if (hasParts) {
    const joined = joinGroupHeadName({
      first: groupHeadNameFirst,
      middle: groupHeadNameMiddle,
      last: groupHeadNameLast,
    });
    merged = {
      ...rest,
      groupHeadName: joined,
      groupName: joined,
    };
  } else {
    merged = { ...formData };
  }

  const preferred =
    merged.preferredAddressType === "office" ? "office" : "resi";
  const cityFromRows =
    preferred === "resi"
      ? merged.resiCity ?? ""
      : merged.officeCity ?? "";
  const stateFromRows =
    preferred === "resi"
      ? merged.resiState ?? ""
      : merged.officeState ?? "";
  const areaFromRows =
    preferred === "resi" ? merged.resiArea ?? "" : merged.officeArea ?? "";
  const subAreaFromRows =
    preferred === "resi"
      ? merged.resiSubArea ?? ""
      : merged.officeSubArea ?? "";

  return {
    ...merged,
    city: cityFromRows || merged.city || "",
    state: stateFromRows || merged.state || "",
    preferredMeetingArea: areaFromRows || merged.preferredMeetingArea || "",
    subArea: subAreaFromRows || merged.subArea || "",
    resiLandmark: "",
    officeLandmark: "",
  };
}

export const GROUP_HEAD_NAME_PART_FIELDS = [
  "groupHeadNameFirst",
  "groupHeadNameMiddle",
  "groupHeadNameLast",
];

/** @deprecated use splitGroupHeadName */
export const splitGroupName = splitGroupHeadName;
/** @deprecated use joinGroupHeadName */
export const joinGroupName = joinGroupHeadName;
/** @deprecated use sanitizePersonalDetailsGroupHead */
export const sanitizePersonalDetailsGroupName = sanitizePersonalDetailsGroupHead;
/** @deprecated use GROUP_HEAD_NAME_PART_FIELDS */
export const GROUP_NAME_PART_FIELDS = GROUP_HEAD_NAME_PART_FIELDS;
