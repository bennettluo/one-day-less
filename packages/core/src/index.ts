export interface UserLifeConfig {
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
  /** 用户是否希望活到某个年龄（如 80 岁），可与 targetAge 对齐或做对比 */
  desiredAge?: number;
  /** 今天过得是否如意，自评分数 1-10 */
  satisfactionScoreToday?: number;
  /** 对现在生活状态的主观描述 */
  currentFeelingText?: string;
  /** 对未来想怎么过的自由描述 */
  futureHopeText?: string;
}

export interface ThirdPartyAppLink {
  id: string;
  label: string;
  description?: string;
  /** 用于 H5 / Web 跳转的 URL */
  url: string;
  /** 可选的原生 / 小程序 Deep Link，用于 App / 小程序跳转 */
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
 * 预留给第三方应用推荐的接口。
 * 未来可以在前端直接实现（本地跳转），也可以由后端实现（Cloudflare D1 / Workers）。
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

