import {
  calculateLifeStats,
  validateConfig,
  ValidationErrorCode,
  type UserLifeConfig
} from "../index";

describe("validateConfig", () => {
  const birthDate = "2000-01-01";

  it("accepts valid config when targetAge is greater than current age", () => {
    const now = new Date("2026-01-01");
    const config: UserLifeConfig = {
      birthDate,
      targetAge: 90
    };

    const result = validateConfig(config, now);
    expect(result.ok).toBe(true);
  });

  it("rejects when targetAge is too small", () => {
    const now = new Date("2026-01-01");
    const config: UserLifeConfig = {
      birthDate,
      targetAge: 20
    };

    const result = validateConfig(config, now);
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCode.TARGET_AGE_TOO_SMALL);
  });

  it("rejects invalid birthdate", () => {
    const config: UserLifeConfig = {
      // @ts-expect-error testing invalid date
      birthDate: "not-a-date",
      targetAge: 80
    };
    const result = validateConfig(config);
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe(ValidationErrorCode.INVALID_BIRTHDATE);
  });
});

describe("calculateLifeStats", () => {
  it("calculates days lived and left correctly for simple case", () => {
    const config: UserLifeConfig = {
      birthDate: "2000-01-01",
      targetAge: 80
    };
    const now = new Date("2020-01-01");

    const stats = calculateLifeStats(config, now);

    expect(stats.currentAgeYears).toBe(20);
    expect(stats.daysLived).toBeGreaterThan(7300);
    expect(stats.daysLeft).toBeGreaterThan(0);
    expect(stats.totalDaysExpected).toBe(stats.daysLived + stats.daysLeft);
    expect(stats.percentLived).toBeGreaterThan(0);
    expect(stats.percentLived).toBeLessThan(1);
  });

  it("throws when config is invalid", () => {
    const badConfig: UserLifeConfig = {
      birthDate: "2000-01-01",
      targetAge: 1
    };

    expect(() => calculateLifeStats(badConfig)).toThrow(
      /Invalid config: TARGET_AGE_TOO_SMALL/
    );
  });
}

