import { NextRequest, NextResponse } from "next/server";

type Language = "zh-CN" | "en-US" | "es-ES" | "fr-FR" | "ja-JP";

const LANGUAGE_COOKIE_KEY = "one-day-less-language";

const SUPPORTED_LANGUAGES: Language[] = [
  "zh-CN",
  "en-US",
  "es-ES",
  "fr-FR",
  "ja-JP"
];

function mapCountryToLanguage(country?: string | null): Language | null {
  if (!country) return null;
  const c = country.toUpperCase();

  if (["CN", "TW", "HK", "SG", "MY"].includes(c)) return "zh-CN";
  if (["ES", "MX", "AR", "CL", "CO", "PE", "VE", "UY"].includes(c))
    return "es-ES";
  if (["FR", "BE", "CH", "CA"].includes(c)) return "fr-FR";
  if (["JP"].includes(c)) return "ja-JP";

  return "en-US";
}

function mapAcceptLanguageToLanguage(acceptLang?: string | null): Language {
  const header = acceptLang?.toLowerCase() ?? "";
  if (header.startsWith("zh")) return "zh-CN";
  if (header.startsWith("es")) return "es-ES";
  if (header.startsWith("fr")) return "fr-FR";
  if (header.startsWith("ja")) return "ja-JP";
  return "en-US";
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const cookieLang = req.cookies.get(LANGUAGE_COOKIE_KEY)?.value as
    | Language
    | undefined;

  if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang)) {
    return res;
  }

  const countryFromGeo = (req.geo && req.geo.country) || null;
  const countryHeader = req.headers.get("x-vercel-ip-country");
  const country = countryFromGeo || countryHeader;

  let lang: Language | null = mapCountryToLanguage(country);

  if (!lang) {
    const acceptLanguage = req.headers.get("accept-language");
    lang = mapAcceptLanguageToLanguage(acceptLanguage);
  }

  res.cookies.set(LANGUAGE_COOKIE_KEY, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/|api/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)"
  ]
};

