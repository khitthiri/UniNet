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

export function visibleYearValues(year) {
  return ["All", "All students", year, `${year}s`];
}
