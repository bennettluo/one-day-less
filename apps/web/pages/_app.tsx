import type { AppProps } from "next/app";
import "../styles/globals.css";
import { I18nProvider } from "../lib/i18nRuntime";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

