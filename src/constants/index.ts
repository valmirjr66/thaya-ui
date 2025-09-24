export const USER_ROLES = [
  "admin",
  "doctor",
  "support",
  "patient",
] as const;

export const SERIES_TYPES: = [
  "blood-pressure-systolic",
  "blood-pressure-diastolic",
  "heart-rate",
  "weight",
  "custom",
] as const;

export const PRESCRIPTION_STATUS = [
    'draft',
    'ready',
    'sent',
    'cancelled',
] as const;
