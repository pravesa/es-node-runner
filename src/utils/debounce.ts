/**
 * This function provides a way to delay the execution of the passed in function by
 * specified amount of delay.
 * @param func callback function
 * @param delay delay in milliseconds
 * @returns debounced function
 */
function debounce(func: (...args: unknown[]) => unknown, delay: number) {
  let timer: NodeJS.Timeout;

  return function debouncedFunc(this: unknown, ...args: unknown[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      return func.apply(this, args);
    }, delay);
  };
}

export default debounce;
