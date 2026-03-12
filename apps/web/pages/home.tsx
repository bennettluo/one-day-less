import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import type { UserLifeConfig, LifeStats } from "@one-day-less/core";
import { calculateLifeStats } from "@one-day-less/core";
import {
  loadUserLifeConfigClient,
  resetUserLifeConfigClient
} from "../lib/storageClient";
import { useI18n } from "../lib/i18nRuntime";

type VisitStats = {
  todayCount: number;
  avgPerDay: number;
  totalDays: number;
  todayHourlyCounts: number[];
};

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
      className="relative inline-block overflow-hidden"
      style={{ height: `${rowHeightRem}rem` }}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${clamped * rowHeightRem}rem)` }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="flex h-full items-center justify-center tabular-nums text-3xl font-semibold leading-none sm:text-4xl"
            style={{ height: `${rowHeightRem}rem` }}
          >
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

const matchstickSegments = {
  a: { x: 8, y: 4, w: 24, h: 4 },
  b: { x: 30, y: 8, w: 4, h: 20 },
  c: { x: 30, y: 32, w: 4, h: 24 },
  d: { x: 8, y: 60, w: 24, h: 4 },
  e: { x: 6, y: 32, w: 4, h: 24 },
  f: { x: 6, y: 8, w: 4, h: 20 },
  g: { x: 8, y: 32, w: 24, h: 4 }
} as const;

type MatchstickSegmentKey = keyof typeof matchstickSegments;

const digitToMatchstickSegments: Record<number, MatchstickSegmentKey[]> = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "g", "c", "d", "e"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"]
};

function MatchstickDigit({ digit }: { digit: number }) {
  const activeSegments =
    digitToMatchstickSegments[((digit % 10) + 10) % 10] ?? [];
  const keys = Object.keys(matchstickSegments) as MatchstickSegmentKey[];

  return (
    <svg
      viewBox="0 0 40 64"
      className="h-16 w-8 sm:h-20 sm:w-10"
      aria-hidden="true"
    >
      {keys.map(key => {
        const seg = matchstickSegments[key];
        const on = activeSegments.includes(key);
        return (
          <rect
            key={key}
            x={seg.x}
            y={seg.y}
            width={seg.w}
            height={seg.h}
            rx={2}
            className={on ? "fill-emerald-400" : "fill-slate-800"}
            opacity={on ? 0.95 : 0.4}
          />
        );
      })}
    </svg>
  );
}

function RunnerIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-4 w-4 md:h-5 md:w-5 text-emerald-200 drop-shadow-[0_0_4px_rgba(16,185,129,0.9)]"
      aria-hidden="true"
    >
      <circle cx="18" cy="6" r="3" fill="currentColor" />
      <path
        d="M10 27l3-6 3 1 2 5M10 16l4-4 4 1 3-2M15 20l2-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-slate-200"
      aria-hidden="true"
    >
      <path
        d="M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 1 0 12 9.5Z"
        fill="currentColor"
      />
      <path
        d="M4.75 12.75C4.72 12.5 4.7 12.25 4.7 12s.02-.5.05-.75L3.2 10.3a.75.75 0 0 1-.15-.9l1.5-2.6a.75.75 0 0 1 .85-.35l1.8.55c.37-.26.78-.48 1.21-.64l.34-1.86A.75.75 0 0 1 10.5 4h3a.75.75 0 0 1 .74.6l.34 1.86c.43.16.84.38 1.21.64l1.8-.55a.75.75 0 0 1 .86.35l1.5 2.6a.75.75 0 0 1-.16.9l-1.55.95c.03.25.06.5.06.75s-.03.5-.06.75l1.55.95a.75.75 0 0 1 .16.9l-1.5 2.6a.75.75 0 0 1-.86.35l-1.8-.55a5 5 0 0 1-1.21.64l-.34 1.86a.75.75 0 0 1-.74.6h-3a.75.75 0 0 1-.74-.6l-.34-1.86a5 5 0 0 1-1.21-.64l-1.8.55a.75.75 0 0 1-.86-.35l-1.5-2.6a.75.75 0 0 1 .15-.9l1.55-.95Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RotateCcwIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path
        d="M11 5V2L7 6l4 4V7c2.76 0 5 2.24 5 5a5 5 0 0 1-8.54 3.54l-1.42 1.42A7 7 0 0 0 18 12c0-3.87-3.13-7-7-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SettingsDropdown() {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleReset = async () => {
    const confirmed = window.confirm(t("settings.reset.confirm"));
    if (!confirmed) return;
    setOpen(false);
    await resetUserLifeConfigClient();
    router.push("/");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 text-slate-200 shadow-sm transition hover:border-emerald-500 hover:bg-slate-800"
        aria-label={t("cta.settings")}
      >
        <SettingsIcon />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-3 text-xs text-slate-200 shadow-lg shadow-black/40 backdrop-blur">
          <p className="mb-2 text-[11px] leading-relaxed text-slate-400">
            {t("settings.reset.description")}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-rose-500/90 px-2.5 py-1.5 text-[11px] font-medium text-black shadow-sm shadow-rose-500/40 transition hover:bg-rose-400"
          >
          <RotateCcwIcon />
            <span>{t("settings.reset.action")}</span>
          </button>
        </div>
      )}
    </div>
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
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [activePulseIndex, setActivePulseIndex] = useState(0);
  const [prevPulseIndex, setPrevPulseIndex] = useState<number | null>(null);
  const { t } = useI18n();

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

      const trackVisit = async () => {
        try {
          const response = await fetch("/api/visits/track", {
            method: "POST"
          });
          if (!response.ok) {
            return;
          }
          const data = (await response.json()) as VisitStats;
          setVisitStats(data);
        } catch {
          // Swallow errors to avoid interrupting the main UX.
        }
      };

      void trackVisit();

      return () => window.clearInterval(id);
    });
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const delay = 1000 + Math.random() * 9000;
    const id = window.setTimeout(() => {
      setActivePulseIndex(prev => {
        if (pulseShapes.length <= 1) return prev;
        let next = Math.floor(Math.random() * pulseShapes.length);
        if (next === prev) {
          next = (prev + 1) % pulseShapes.length;
        }
        setPrevPulseIndex(prev);
        return next;
      });
    }, delay);
    return () => window.clearTimeout(id);
  }, [activePulseIndex]);

  if (!config || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-slate-300">
        <p className="animate-pulse text-sm text-slate-400">
          {t("loading")}
        </p>
      </main>
    );
  }

  const percent = Math.min(
    100,
    Math.max(0, Math.round(stats.percentLived * 100))
  );
  const daysLeftStr = stats.daysLeft.toString();

  const isBelowAverage =
    !!visitStats &&
    visitStats.totalDays >= 3 &&
    visitStats.avgPerDay > 0 &&
    visitStats.todayCount < visitStats.avgPerDay;

  const todayHourlyCounts = visitStats?.todayHourlyCounts ?? [];
  const activeHours =
    todayHourlyCounts.length === 24
      ? todayHourlyCounts.filter(count => count > 0).length
      : 0;

  let pulseScaleX = 1;
  if (activeHours > 0) {
    const ratio = activeHours / 24;
    const maxScale = 1.3;
    const minScale = 0.7;
    pulseScaleX = maxScale - ratio * (maxScale - minScale);
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black px-6 py-10 text-slate-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-500/20">
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
        <div className="flex items-center gap-1">
          <SettingsDropdown />
        </div>
      </header>

      <section className="flex min-h-[70vh] flex-1 flex-col items-center justify-center">
        <div className="space-y-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 md:text-base">
            {t("home.section.title")}
          </p>
          <p className="text-5xl font-semibold tracking-tight text-emerald-400 sm:text-6xl md:text-7xl">
            <span className="inline-flex items-end justify-center gap-1 font-extrabold sm:gap-1.5">
              {daysLeftStr.split("").map((ch, index) =>
                ch >= "0" && ch <= "9" ? (
                  <MatchstickDigit key={index} digit={Number(ch)} />
                ) : (
                  <span
                    key={index}
                    className="px-1 text-4xl text-emerald-200/80 sm:text-5xl"
                  >
                    {ch}
                  </span>
                )
              )}
              <span className="ml-3 text-3xl text-emerald-300/90 md:text-4xl">
                {t("home.section.unit.day")}
              </span>
            </span>
          </p>
          {countdown && (
            <div className="mt-4 space-y-3 text-emerald-200/90">
              <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-500/80">
                {t("home.countdown.caption")}
              </p>
              <p className="heartbeat flex h-10 items-center justify-center gap-1 px-4">
                {(() => {
                  const h = countdown.hours.toString().padStart(2, "0");
                  const m = countdown.minutes.toString().padStart(2, "0");
                  const s = countdown.seconds.toString().padStart(2, "0");
                  return (
                    <>
                      <DigitReel digit={Number(h[0])} />
                      <DigitReel digit={Number(h[1])} />
                      <span className="flex items-center justify-center text-2xl leading-none sm:text-3xl">
                        :
                      </span>
                      <DigitReel digit={Number(m[0])} />
                      <DigitReel digit={Number(m[1])} />
                      <span className="flex items-center justify-center text-2xl leading-none sm:text-3xl">
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
                  className={`h-full w-full ${
                    isBelowAverage ? "text-emerald-400/30" : "text-emerald-400/70"
                  }`}
                  style={{
                    transform: `scaleX(${pulseScaleX})`,
                    transformOrigin: "center"
                  }}
                >
                  {prevPulseIndex !== null && (
                    <g className="transition-opacity duration-700 ease-out opacity-0">
                      <path
                        className="pulse-line"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        d={pulseShapes[prevPulseIndex].main}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        className="pulse-line-soft"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        d={pulseShapes[prevPulseIndex].soft}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}
                  <g className="transition-opacity duration-700 ease-out opacity-100">
                    <path
                      className="pulse-line"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      d={pulseShapes[activePulseIndex].main}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className="pulse-line-soft"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      d={pulseShapes[activePulseIndex].soft}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </div>
            </div>
          )}

          <div className="relative mx-auto mt-6 h-2 w-72 max-w-full rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percent}%` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 flex items-center transition-all"
              style={{
                left: `${percent}%`,
                transform: "translateX(-50%)"
              }}
            >
              <RunnerIcon />
            </div>
          </div>
          <p className="text-sm text-slate-300 md:text-base">
            {t("home.progress.text", {
              days: stats.daysLived.toLocaleString(),
              percent
            })}
          </p>
        </div>
      </section>

      <footer className="mt-8 space-y-2 text-center text-xs text-slate-500">
        <p>{t("home.footer")}</p>
      </footer>
    </main>
  );
}

