import { useEffect, useState } from "react";
import type { UserLifeConfig, LifeStats } from "@one-day-less/core";
import { calculateLifeStats, validateConfig } from "@one-day-less/core";
import { createIndexedDbStorage } from "@one-day-less/storage";

type ViewState = "loading" | "onboarding" | "summary";

const storage = createIndexedDbStorage();

export function PopupApp() {
  const [view, setView] = useState<ViewState>("loading");
  const [config, setConfig] = useState<UserLifeConfig | null>(null);
  const [stats, setStats] = useState<LifeStats | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storage
      .loadUserLifeConfig()
      .then(saved => {
        if (saved) {
          setConfig(saved);
          setStats(calculateLifeStats(saved));
          setView("summary");
        } else {
          setView("onboarding");
        }
      })
      .catch(() => setView("onboarding"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetAgeNumber = Number(targetAge);
    const newConfig: UserLifeConfig = {
      birthDate,
      targetAge: targetAgeNumber
    };

    const result = validateConfig(newConfig);
    if (!result.ok) {
      if (result.errorCode === "TARGET_AGE_TOO_SMALL") {
        setError("你不想活了吗，哈哈。目标年龄要比现在大一点。");
      } else {
        setError("填写的信息不太对，再检查一下～");
      }
      return;
    }

    await storage.saveUserLifeConfig(newConfig);
    const newStats = calculateLifeStats(newConfig);
    setConfig(newConfig);
    setStats(newStats);
    setView("summary");
  };

  if (view === "loading") {
    return (
      <div className="w-[320px] p-4 text-xs text-slate-500">
        <p>加载中…</p>
      </div>
    );
  }

  if (view === "onboarding") {
    return (
      <div className="w-[320px] space-y-3 bg-black px-4 py-3 text-slate-100">
        <header className="space-y-1">
          <h1 className="text-sm font-semibold text-white">One Day Less</h1>
          <p className="text-[11px] text-slate-400">
            先告诉我你的生日和你想活到多少岁。
          </p>
        </header>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="birthDate"
              className="block text-[11px] font-medium text-slate-200"
            >
              生日
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="block w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="targetAge"
              className="block text-[11px] font-medium text-slate-200"
            >
              想活到多少岁
            </label>
            <input
              id="targetAge"
              type="number"
              min={1}
              inputMode="numeric"
              value={targetAge}
              onChange={e => setTargetAge(e.target.value)}
              className="block w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
              required
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-black"
          >
            保存并查看剩余天数
          </button>
        </form>
      </div>
    );
  }

  if (!config || !stats) return null;

  const percent = Math.min(100, Math.max(0, Math.round(stats.percentLived * 100)));

  return (
    <div className="w-[320px] space-y-3 bg-black px-4 py-3 text-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">One Day Less</h1>
          <p className="text-[11px] text-slate-400">
            今天，又少了一天。
          </p>
        </div>
      </header>

      <section className="space-y-2 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          你的一生还剩
        </p>
        <p className="text-3xl font-semibold tracking-tight text-emerald-400">
          {stats.daysLeft.toLocaleString()}
        </p>
        <p className="text-xs text-slate-300">天</p>

        <div className="mx-auto mt-2 h-1.5 w-64 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          已走过{" "}
          <span className="font-semibold text-slate-100">
            {stats.daysLived.toLocaleString()} 天
          </span>
          ，约占一生的{" "}
          <span className="font-semibold text-emerald-400">
            {percent}%
          </span>
          。
        </p>
      </section>

      <footer className="text-[10px] text-slate-500">
        把这一个小小的弹窗，当成提醒你珍惜今天的铃声。
      </footer>
    </div>
  );
}

