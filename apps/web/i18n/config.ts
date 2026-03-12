export type Language = "zh-CN" | "en-US" | "es-ES" | "fr-FR" | "ja-JP";

export const LANGUAGE_COOKIE_KEY = "one-day-less-language";

export const SUPPORTED_LANGUAGES: { code: Language; label: string }[] = [
  { code: "en-US", label: "English" },
  { code: "zh-CN", label: "简体中文" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "ja-JP", label: "日本語" }
];

