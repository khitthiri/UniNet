// Canonicalises academic-year / assignedTo values so that legacy or malformed
// inputs ("All students", "Freshmans", " senior ") still map to the right bucket.
const YEAR_MAP = {
  all: "All",
  "all students": "All",
  freshman: "Freshman", freshmans: "Freshman", freshmen: "Freshman",
  sophomore: "Sophomore", sophomores: "Sophomore",
  junior: "Junior", juniors: "Junior",
  senior: "Senior", seniors: "Senior",
  graduate: "Graduate", graduates: "Graduate", grad: "Graduate",
};

export function normalizeYear(value) {
  if (!value) return value;
  const key = String(value).trim().toLowerCase();
  return YEAR_MAP[key] || value;
}

// Every stored variant that should be treated as "visible to this student".
export function visibleYearValues(year) {
  return ["All", "All students", year, `${year}s`];
}
