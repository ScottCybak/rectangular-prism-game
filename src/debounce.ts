export const debounce = <T extends (...args: any[]) => any>(fn: T, delayMs = 500): (...args: Parameters<T>) => void => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}
