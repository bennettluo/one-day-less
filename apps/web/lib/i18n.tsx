import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

type Language = "zh-CN" | "en-US";

type MessageKey =
  | "app.title"
  | "app.subtitle"
  | "onboarding.birthDate.label"
  | "onboarding.birthDate.help"
  | "onboarding.targetAge.label"
  | "onboarding.targetAge.placeholder"
  | "onboarding.submit"
  | "onboarding.footer"
  | "home.header.subtitle"
  | "home.section.title"
  | "home.section.unit.day"
  | "home.countdown.caption"
  | "home.progress.text"
  | "home.footer"
  | "settings.title"
  | "settings.back"
  | "settings.save"
  | "settings.birthDate.label"
  | "settings.targetAge.label"
  | "cta.settings"
  | "loading"
  | "error.targetAge.tooSmall"
  | "error.birthDate.invalid"
  | "error.targetAge.invalid";

type Messages = Record<MessageKey, string>;

const zhCN: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "又少了一天，你想怎么过？",
  "onboarding.birthDate.label": "你的生日",
  "onboarding.birthDate.help": "选一个真实的生日，接下来的数字才有意义。",
  "onboarding.targetAge.label": "你希望活到多少岁",
  "onboarding.targetAge.placeholder": "例如 80、90",
  "onboarding.submit": "开始计算",
  "onboarding.footer": "不再只盯着银行余额，开始看看生命余额。",
  "home.header.subtitle": "今天，又少了一天。你打算怎么用？",
  "home.section.title": "你的一生还剩",
  "home.section.unit.day": "天",
  "home.countdown.caption": "生命在跳动",
  "home.progress.text": "你已经走过 {days} 天，约占一生的 {percent}%。",
  "home.footer": "把今天当成最后一天来过，但别把它浪费掉。",
  "settings.title": "设置",
  "settings.back": "← 返回",
  "settings.save": "保存",
  "settings.birthDate.label": "你的生日",
  "settings.targetAge.label": "你希望活到多少岁",
  "cta.settings": "设置",
  "loading": "加载中…",
  "error.targetAge.tooSmall":
    "你不想活了吗，哈哈。目标年龄要比现在大一点。",
  "error.birthDate.invalid": "生日好像不太对，再检查一下～",
  "error.targetAge.invalid": "目标年龄需要是一个大于 0 的数字。"
};

const enUS: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "One more day is gone. How will you live today?",
  "onboarding.birthDate.label": "Your birthday",
  "onboarding.birthDate.help":
    "Use your real birthday so the numbers truly reflect your life.",
  "onboarding.targetAge.label": "How old do you want to live to",
  "onboarding.targetAge.placeholder": "For example 80 or 90",
  "onboarding.submit": "Start counting",
  "onboarding.footer":
    "Stop checking only your bank balance. Start checking your life balance.",
  "home.header.subtitle":
    "Another day is gone. What will you do with what remains?",
  "home.section.title": "You have about this much life left",
  "home.section.unit.day": "days",
  "home.countdown.caption": "Your life is beating",
  "home.progress.text":
    "You have already lived {days} days, about {percent}% of your life.",
  "home.footer":
    "Live today as if it were your last, but don’t actually waste it.",
  "settings.title": "Settings",
  "settings.back": "← Back",
  "settings.save": "Save",
  "settings.birthDate.label": "Your birthday",
  "settings.targetAge.label": "How old do you want to live to",
  "cta.settings": "Settings",
  "loading": "Loading…",
  "error.targetAge.tooSmall":
    "So you don't want to live any longer? 😄 Aim a bit higher.",
  "error.birthDate.invalid": "That birthday doesn’t look right.",
  "error.targetAge.invalid": "Target age must be a number greater than 0."
};

const dictionaries: Record<Language, Messages> = {
  "zh-CN": zhCN,
  "en-US": enUS
};

interface I18nContextValue {
  language: Language;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "one-day-less-language";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh-CN");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "zh-CN" || saved === "en-US") {
      setLanguageState(saved);
    } else if (navigator.language.startsWith("zh")) {
      setLanguageState("zh-CN");
    } else {
      setLanguageState("en-US");
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const dict = dictionaries[language];
      let template = dict[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          template = template.replace(`{${k}}`, String(v));
        });
      }
      return template;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      type="button"
      onClick={() =>
        setLanguage(language === "zh-CN" ? "en-US" : "zh-CN")
      }
      className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-sm transition hover:border-emerald-500 hover:text-emerald-300"
      aria-label="Switch language"
    >
      <span
        className={
          language === "zh-CN"
            ? "text-emerald-400"
            : "text-slate-500"
        }
      >
        中
      </span>
      <span className="text-slate-600">/</span>
      <span
        className={
          language === "en-US"
            ? "text-emerald-400"
            : "text-slate-500"
        }
      >
        EN
      </span>
    </button>
  );
}

