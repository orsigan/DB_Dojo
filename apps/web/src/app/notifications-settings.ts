export const NOTIFICATIONS_STORAGE_KEY = 'db-dojo:notifications-enabled';

export function notificationsEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw === null ? true : (JSON.parse(raw) as boolean);
  } catch {
    return true;
  }
}
