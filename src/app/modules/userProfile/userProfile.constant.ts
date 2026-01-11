export const EMBEDDING_FIELDS: string[] = [
  "headline",
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
];

type TScalerField =
  | "headline"
  | "summary"
  | "totalYearsOfExperience"
  | "currentRole"
  | "employmentType"
  | "jobPreference"
  | "location";

export const SCALER_FIELDS_UPDATE = [
  "headline",
  "summary",
  "totalYearsOfExperience",
  "currentRole",
  "employmentType",
  "jobPreference",
  "location",
] as const satisfies readonly TScalerField[];
