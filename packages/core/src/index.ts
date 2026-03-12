export interface UserLifeConfig {
  /** User's name, used for personalized display */
  name?: string;
  /** Where the user is from (city / country), used for copy and context */
  origin?: string;
  birthDate: string | Date;
  targetAge: number;
  timeZone?: string;
  language?: string;
  theme?: "light" | "dark" | "system" | string;
}

export interface LifeStats {
  currentAgeYears: number;
  totalDaysExpected: number;
  daysLived: number;
  daysLeft: number;
  percentLived: number;
}

export interface LifeReflectionAnswers {
  /** Whether the user wants to live to a certain age (e.g. 80), can align with or contrast targetAge */
  desiredAge?: number;
  /** How satisfied today felt, self‑rated on a 1–10 scale */
  satisfactionScoreToday?: number;
  /** Free‑form description of the current life state */
  currentFeelingText?: string;
  /** Free‑form description of how they want to live in the future */
  futureHopeText?: string;
}

export interface ThirdPartyAppLink {
  id: string;
  label: string;
  description?: string;
  /** URL used for H5 / Web navigation */
  url: string;
  /** Optional native / mini‑program deep link for app / mini‑program navigation */
  deepLink?: string;
  provider?: string;
  category?: "mental_health" | "productivity" | "finance" | "relationship" | "other";
}

export interface ThirdPartySuggestionRequest {
  lifeConfig: UserLifeConfig;
  lifeStats: LifeStats;
  reflection?: LifeReflectionAnswers;
}

export interface ThirdPartySuggestionResult {
  links: ThirdPartyAppLink[];
}

/**
 * Port reserved for third‑party app recommendations.
 * In the future this can be implemented purely on the client (local navigation)
 * or by a backend service (e.g. Cloudflare D1 / Workers).
 */
export interface ThirdPartySuggestionPort {
  getSuggestions(
    request: ThirdPartySuggestionRequest
  ): Promise<ThirdPartySuggestionResult>;
}

export enum ValidationErrorCode {
  TARGET_AGE_TOO_SMALL = "TARGET_AGE_TOO_SMALL",
  INVALID_BIRTHDATE = "INVALID_BIRTHDATE",
  INVALID_TARGET_AGE = "INVALID_TARGET_AGE"
}

export interface ValidationResult {
  ok: boolean;
  errorCode?: ValidationErrorCode;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffInDays(from: Date, to: Date): number {
  const fromStart = startOfDay(from).getTime();
  const toStart = startOfDay(to).getTime();
  return Math.round((toStart - fromStart) / MS_PER_DAY);
}

function calculateCurrentAgeYears(birthDate: Date, now: Date): number {
  let years = now.getFullYear() - birthDate.getFullYear();
  const nowMonth = now.getMonth();
  const birthMonth = birthDate.getMonth();

  if (
    nowMonth < birthMonth ||
    (nowMonth === birthMonth && now.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }

  return years < 0 ? 0 : years;
}

export function validateConfig(
  config: UserLifeConfig,
  now: Date = new Date()
): ValidationResult {
  const birth = toDate(config.birthDate);
  if (!birth) {
    return { ok: false, errorCode: ValidationErrorCode.INVALID_BIRTHDATE };
  }

  if (!Number.isFinite(config.targetAge) || config.targetAge <= 0) {
    return { ok: false, errorCode: ValidationErrorCode.INVALID_TARGET_AGE };
  }

  const currentAgeYears = calculateCurrentAgeYears(birth, now);

  if (config.targetAge <= currentAgeYears) {
    return { ok: false, errorCode: ValidationErrorCode.TARGET_AGE_TOO_SMALL };
  }

  return { ok: true };
}

export function calculateLifeStats(
  config: UserLifeConfig,
  now: Date = new Date()
): LifeStats {
  const birth = toDate(config.birthDate);
  if (!birth) {
    throw new Error("Invalid birthDate in config");
  }

  const valid = validateConfig(config, now);
  if (!valid.ok) {
    throw new Error(`Invalid config: ${valid.errorCode}`);
  }

  const currentAgeYears = calculateCurrentAgeYears(birth, now);

  const targetDate = new Date(birth);
  targetDate.setFullYear(birth.getFullYear() + config.targetAge);

  const totalDaysExpected = Math.max(0, diffInDays(birth, targetDate));
  const daysLivedRaw = diffInDays(birth, now);
  const daysLived =
    totalDaysExpected > 0
      ? Math.min(Math.max(0, daysLivedRaw), totalDaysExpected)
      : Math.max(0, daysLivedRaw);

  const daysLeft = Math.max(0, totalDaysExpected - daysLived);
  const percentLived =
    totalDaysExpected <= 0 ? 1 : daysLived / totalDaysExpected;

  return {
    currentAgeYears,
    totalDaysExpected,
    daysLived,
    daysLeft,
    percentLived
  };
}

