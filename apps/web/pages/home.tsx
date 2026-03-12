import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { UserLifeConfig, LifeStats } from "@one-day-less/core";
import { calculateLifeStats } from "@one-day-less/core";
import { loadUserLifeConfigClient } from "../lib/storageClient";
import { LanguageToggle, useI18n } from "../lib/i18n";

const pulseShapes = [
  {
    main:
      "M2 20 H28 L40 14 L52 26 L64 8 L78 30 L92 16 L106 24 L122 10 L138 28 L154 18 L170 22 L186 20",
    soft:
      "M2 22 H22 L34 18 L46 24 L58 16 L72 28 L86 20 L100 26 L116 14 L132 30 L150 20 L170 24 L186 22"
  },
  {
    main:
      "M2 20 H24 L36 12 L48 28 L62 6 L78 32 L94 18 L110 24 L126 14 L144 26 L164 18 L182 22 L198 20",
    soft:
      "M2 21 H20 L32 17 L44 23 L56 15 L70 27 L84 19 L100 25 L116 13 L132 29 L150 21 L170 23 L188 21"
  },
  {
    main:
      "M2 20 H26 L40 16 L52 24 L66 10 L82 30 L98 14 L114 26 L130 12 L148 28 L166 18 L184 22 L198 20",
    soft:
      "M2 19 H18 L30 15 L44 21 L58 13 L72 25 L88 17 L104 23 L120 15 L136 27 L154 19 L172 21 L188 19"
  }
];

function DigitReel({ digit }: { digit: number }) {
  const clamped = ((digit % 10) + 10) % 10;
  const rowHeightRem = 2.5;
  return (
    <span
      className="relative inline-block overflow-hidden align-middle"
      style={{ height: `${rowHeightRem}rem` }}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${clamped * rowHeightRem}rem)` }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="block tabular-nums text-3xl font-semibold leading-none sm:text-4xl"
            style={{ height: `${rowHeightRem}rem` }}
          >
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [config, setConfig] = useState<UserLifeConfig | null>(null);
  const [stats, setStats] = useState<LifeStats | null>(null);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const { t, language } = useI18n();

  useEffect(() => {
    loadUserLifeConfigClient().then(loaded => {
      if (!loaded) {
        router.replace("/");
        return;
      }
      setConfig(loaded);
      const s = calculateLifeStats(loaded);
      setStats(s);

      const birth =
        typeof loaded.birthDate === "string"
          ? new Date(loaded.birthDate)
          : loaded.birthDate;
      const target = new Date(birth);
      target.setFullYear(birth.getFullYear() + loaded.targetAge);

      const updateCountdown = () => {
        const now = new Date();
        const diff = Math.max(0, target.getTime() - now.getTime());
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor(
          (totalSeconds % (24 * 60 * 60)) / (60 * 60)
        );
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;
        setCountdown({ days, hours, minutes, seconds });
      };

      updateCountdown();
      const id = window.setInterval(updateCountdown, 1000);
      return () => window.clearInterval(id);
    });
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const delay = 1000 + Math.random() * 9000;
    const id = window.setTimeout(() => {
      setPulseIndex(prev => {
        if (pulseShapes.length <= 1) return prev;
        let next = Math.floor(Math.random() * pulseShapes.length);
        if (next === prev) {
          next = (prev + 1) % pulseShapes.length;
        }
        return next;
      });
    }, delay);
    return () => window.clearTimeout(id);
  }, [pulseIndex]);

  if (!config || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-slate-300">
        <p className="animate-pulse text-sm text-slate-400">
          {t("loading")}
        </p>
      </main>
    );
  }

  const percent = Math.min(100, Math.max(0, Math.round(stats.percentLived * 100)));

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black px-6 py-10 text-slate-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-500/20">
            <img
              src="/one-day-less-logo.svg"
              alt="One Day Less logo"
              className="h-4 w-4"
            />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {t("app.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => router.push("/settings")}
            className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800"
          >
            {t("cta.settings")}
          </button>
        </div>
      </header>

      <section className="flex min-h-[70vh] flex-1 flex-col items-center justify-center">
        <div className="space-y-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 md:text-base">
            {t("home.section.title")}
          </p>
          <p className="text-6xl font-semibold tracking-tight text-emerald-400 sm:text-7xl md:text-8xl">
            {stats.daysLeft.toLocaleString()}
            <span className="ml-3 align-middle text-3xl text-emerald-300/90 md:text-4xl">
              {t("home.section.unit.day")}
            </span>
          </p>
          {countdown && (
            <div className="mt-4 space-y-3 text-emerald-200/90">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-500/80">
                {t("home.countdown.caption")}
              </p>
              <p className="heartbeat inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-4 py-2">
                {(() => {
                  const h = countdown.hours.toString().padStart(2, "0");
                  const m = countdown.minutes.toString().padStart(2, "0");
                  const s = countdown.seconds.toString().padStart(2, "0");
                  return (
                    <>
                      <DigitReel digit={Number(h[0])} />
                      <DigitReel digit={Number(h[1])} />
                      <span className="flex items-center justify-center text-2xl sm:text-3xl">
                        :
                      </span>
                      <DigitReel digit={Number(m[0])} />
                      <DigitReel digit={Number(m[1])} />
                      <span className="flex items-center justify-center text-2xl sm:text-3xl">
                        :
                      </span>
                      <DigitReel digit={Number(s[0])} />
                      <DigitReel digit={Number(s[1])} />
                    </>
                  );
                })()}
              </p>

              <div className="mx-auto h-10 w-64 max-w-full">
                <svg
                  viewBox="0 0 200 40"
                  className="h-full w-full text-emerald-400/70"
                >
                  <path
                    className="pulse-line"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    d={pulseShapes[pulseIndex].main}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    className="pulse-line-soft"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    d={pulseShapes[pulseIndex].soft}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}

          <div className="mx-auto mt-6 h-2 w-72 max-w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm text-slate-300 md:text-base">
            {language === "zh-CN" ? (
              <>
                你已经走过{" "}
                <span className="text-emerald-400">
                  <span className="text-base font-semibold md:text-lg">
                    {stats.daysLived.toLocaleString()}
                  </span>{" "}
                  天
                </span>
                ，约占一生的{" "}
                <span className="text-emerald-400">
                  <span className="text-base font-semibold md:text-lg">
                    {percent}%
                  </span>
                </span>
                。
              </>
            ) : (
              <>
                You have already lived{" "}
                <span className="text-emerald-400">
                  <span className="text-base font-semibold md:text-lg">
                    {stats.daysLived.toLocaleString()}
                  </span>{" "}
                  days
                </span>
                , about{" "}
                <span className="text-emerald-400">
                  <span className="text-base font-semibold md:text-lg">
                    {percent}%
                  </span>
                </span>{" "}
                of your life.
              </>
            )}
          </p>
        </div>
      </section>

      <footer className="mt-8 space-y-2 text-center text-xs text-slate-500">
        <p>{t("home.footer")}</p>
      </footer>
    </main>
  );
}

