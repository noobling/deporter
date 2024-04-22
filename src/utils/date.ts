export function getTimestamps() {
  return {
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

const MILLISECONDS_IN_A_DAY = 86400000;
export function getDaysToGo(startTime?: string): number {
  if (!startTime) return 0;

  try {
    const now = new Date().toISOString();
    const diff = Math.floor(
      (Date.parse(startTime) - Date.parse(now)) / MILLISECONDS_IN_A_DAY
    );
    return diff;
  } catch {
    return 0;
  }
}
