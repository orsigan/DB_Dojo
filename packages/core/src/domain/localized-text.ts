export type Language = 'de' | 'en';

export type LocalizedText = Record<Language, string>;

export function localize(text: LocalizedText, language: Language): string {
  return text[language];
}
