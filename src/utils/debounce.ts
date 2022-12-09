/**
 * This function provides a way to delay the execution of the passed in function by
 * specified amount of delay.
 * @param func callback function
 * @param delay delay in milliseconds
 * @returns debounced function
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
) {
  let timer: NodeJS.Timeout | undefined;

  return function debouncedFunc(this: unknown, ...args: unknown[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      return fn.apply(this, args);
    }, delay);
  };
}

export default debounce;
