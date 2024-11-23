export async function profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = new Date();
  const result = await fn();
  const end = new Date();
  const duration = end.getTime() - start.getTime();
  console.log(`${name} took ${duration}ms`);
  return result;
} 
