import { useApp } from "../app/context/AppContext";
import en from "../locales/en.json";
import vi from "../locales/vi.json";
import zh from "../locales/zh.json";

const locales: Record<string, typeof en> = { EN: en, VI: vi, ZH: zh };

export function useLocale() {
  const { language } = useApp();
  return locales[language] || locales.EN;
}
