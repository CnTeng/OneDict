const HAN_PATTERN = /\p{Script_Extensions=Han}/u;
const JAPANESE_PATTERN =
  /\p{Script_Extensions=Han}|\p{Script_Extensions=Hiragana}|\p{Script_Extensions=Katakana}/u;
const KOREAN_PATTERN = /\p{Script_Extensions=Han}|\p{Script_Extensions=Hangul}/u;

function getBaseLanguage(language?: string) {
  const locale = language?.trim().replaceAll("_", "-");
  if (!locale) return undefined;

  try {
    return new Intl.Locale(locale).language;
  } catch {
    return undefined;
  }
}

function matchesLanguageScript(text: string, language: string) {
  const script = new Intl.Locale(language).maximize().script;
  if (script === "Hans" || script === "Hant") return HAN_PATTERN.test(text);
  if (script === "Jpan") return JAPANESE_PATTERN.test(text);
  if (script === "Kore") return KOREAN_PATTERN.test(text);
  return script ? new RegExp(`\\p{Script_Extensions=${script}}`, "u").test(text) : false;
}

export function detectLanguage(text: string, fallback?: string) {
  const fallbackLanguage = getBaseLanguage(fallback);
  if (fallbackLanguage) return fallbackLanguage;
  if (/\p{Script_Extensions=Hiragana}|\p{Script_Extensions=Katakana}/u.test(text)) return "ja";
  if (/\p{Script_Extensions=Hangul}/u.test(text)) return "ko";
  if (HAN_PATTERN.test(text)) return "zh";
  return "en";
}

export function resolveSupportedLanguages(
  text: string,
  supportedLanguages: string[],
  fallback?: string,
) {
  const matchedLanguages = supportedLanguages.filter((language) =>
    matchesLanguageScript(text, language),
  );
  if (matchedLanguages.length > 0) return matchedLanguages;

  const fallbackLanguage = getBaseLanguage(fallback);
  return fallbackLanguage && supportedLanguages.includes(fallbackLanguage)
    ? [fallbackLanguage]
    : [];
}
