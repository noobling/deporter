export function getTimestamps() {
  return {
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}
