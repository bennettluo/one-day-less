import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { UserLifeConfig } from "@one-day-less/core";
import { ValidationErrorCode, validateConfig } from "@one-day-less/core";
import {
  loadUserLifeConfigClient,
  saveUserLifeConfigClient
} from "../lib/storageClient";
import { LanguageToggle, useI18n } from "../lib/i18n";

export default function OnboardingPage() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [error, setError] = useState<ValidationErrorCode | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    loadUserLifeConfigClient().then(config => {
      if (config) {
        router.replace("/home");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetAgeNumber = Number(targetAge);
    const config: UserLifeConfig = {
      birthDate,
      targetAge: targetAgeNumber
    };

    const result = validateConfig(config);
    if (!result.ok) {
      setError(result.errorCode ?? null);
      return;
    }

    await saveUserLifeConfigClient(config);
    router.push("/home");
  };

  const renderError = () => {
    if (!error) return null;

    if (error === ValidationErrorCode.TARGET_AGE_TOO_SMALL) {
      return (
        <p className="mt-2 text-sm text-rose-400">
          {t("error.targetAge.tooSmall")}
        </p>
      );
    }

    if (error === ValidationErrorCode.INVALID_BIRTHDATE) {
      return (
        <p className="mt-2 text-sm text-rose-400">
          {t("error.birthDate.invalid")}
        </p>
      );
    }

    if (error === ValidationErrorCode.INVALID_TARGET_AGE) {
      return (
        <p className="mt-2 text-sm text-rose-400">
          {t("error.targetAge.invalid")}
        </p>
      );
    }

    return null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black via-slate-950 to-black px-6">
      <div className="w-full max-w-md space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t("app.title")}
          </h1>
          <p className="text-xl text-slate-300 sm:text-2xl">
            {t("app.subtitle")}
          </p>
          <div className="mt-2 flex justify-center">
            <LanguageToggle />
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40 backdrop-blur">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-slate-200"
              >
                {t("onboarding.birthDate.label")}
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none ring-0 transition hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                max={new Date().toISOString().slice(0, 10)}
                required
              />
              <p className="text-xs text-slate-500">
                {t("onboarding.birthDate.help")}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="targetAge"
                className="block text-sm font-medium text-slate-200"
              >
                {t("onboarding.targetAge.label")}
              </label>
              <div className="flex items-stretch rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-white shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/40">
                <button
                  type="button"
                  onClick={() => {
                    const n = Math.max(1, (parseInt(targetAge || "0", 10) || 0) - 1);
                    setTargetAge(String(n));
                  }}
                  className="flex w-10 items-center justify-center border-r border-slate-700 text-base text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  aria-label="减少一岁"
                >
                  −
                </button>
                <input
                  id="targetAge"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={targetAge}
                  onChange={e => setTargetAge(e.target.value.replace(/[^0-9]/g, ""))}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-center outline-none ring-0"
                  placeholder={t("onboarding.targetAge.placeholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const n = Math.min(
                      120,
                      (parseInt(targetAge || "0", 10) || 0) + 1
                    );
                    setTargetAge(String(n));
                  }}
                  className="flex w-10 items-center justify-center border-l border-slate-700 text-base text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  aria-label="增加一岁"
                >
                  +
                </button>
              </div>
              {renderError()}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {t("onboarding.submit")}
            </button>
          </form>
        </section>

        <p className="text-center text-xs text-slate-500">
          {t("onboarding.footer")}
        </p>
      </div>
    </main>
  );
}

