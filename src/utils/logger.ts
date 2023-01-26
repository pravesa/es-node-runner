/* eslint-disable no-console */

import {Console} from 'console';
import {spawnOptions} from '../config.js';

// Note:
// ANSI Escape Sequence (\033 or \x1B)
// \x1B[ (ESC [) or \x9B followed by command or arguments separated by (;)

// Colors are supported in TTY (8 / 16 / 256 colors)
// Modern terminals support 24-bit true colors (RGB)

// ESC[(30 - 37)m for foreground and ESC[(40 - 47)m for background basic color
// ESC[{t};{f};{n}m for 256 color
// ESC[{t};{f};{r};{g};{b}m for RGB color
// where,
// t is 38 (foreground) or 48 (background)
// f is 5 (8-bit format) or 2 (24-bit format)
// n is 0 to 255 color index
// r,g,b are 0 to 255 each for RGB color

// \x1B[0m - resets all modes and styles

enum COLORS {
  gray = '242m', // 236, 238, 240, 242
  blue = '45m', // 27, 33, 39, 45
  green = '46m', // 28, 34, 40, 46
  red = '196m', // 124, 160, 196
  yellow = '227m', // 226, 227, 228
  orange = '208m', // 202, 208, 214
  magenta = '207m', // 201, 207, 213
}

type LoggerColors = keyof typeof COLORS;

// Custom logger with color support extending Console
class Logger extends Console {
  // Default print to console with color enabled
  printToConsole = (
    message: unknown,
    optionalParams: unknown[],
    color: LoggerColors
  ) => {
    super.log(`\x1B[38;5;${COLORS[color]}${message}\x1B[0m`, ...optionalParams);
  };

  constructor() {
    super(process.stdout, process.stderr, false);

    // Without color if the stdout is not tty
    if (!process.stdout.isTTY) {
      this.printToConsole = (message: unknown, optionalParams: unknown[]) => {
        super.log(message, ...optionalParams);
      };
    }
  }

  override log(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'gray');
  }

  override info(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'blue');
  }

  override warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'yellow');
  }

  override error(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'red');
  }

  success(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'green');
  }

  alert(message?: unknown, ...optionalParams: unknown[]): void {
    this.printToConsole(message, optionalParams, 'orange');
  }
}

const noop = () => undefined;

// Initiates with new Logger Object if logging is enabled else
// assigned with no operation logger object (this method is
// faster compared to alternative methods).
const logger = spawnOptions.logging
  ? new Logger()
  : {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      success: noop,
      alert: noop,
    };

export default logger;
