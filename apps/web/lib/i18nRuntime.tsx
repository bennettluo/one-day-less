import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Language } from "../i18n/config";
import { LANGUAGE_COOKIE_KEY, SUPPORTED_LANGUAGES } from "../i18n/config";
import { dictionaries, type MessageKey } from "../i18n/messages";

interface I18nContextValue {
  language: Language;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = LANGUAGE_COOKIE_KEY;

function readCookieLanguage(): Language | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ").filter(Boolean);
  const target = cookies.find(c => c.startsWith(`${STORAGE_KEY}=`));
  if (!target) return null;
  const value = decodeURIComponent(target.split("=")[1]) as Language;
  if (SUPPORTED_LANGUAGES.some(item => item.code === value)) {
    return value;
  }
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh-CN");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cookieLang = readCookieLanguage();
    if (cookieLang) {
      setLanguageState(cookieLang);
      return;
    }

    // Fallback: if no cookie (should be rare because middleware sets it),
    // default to English.
    setLanguageState("en-US");
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
    <I18nContext.Provider value={{ language, t }}>
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
