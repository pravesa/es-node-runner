import {resolve} from 'path';
import DEBUG from 'debug';
import {createRequire} from 'module';

const arg = process.argv.slice(2);
const idx = arg.indexOf('--debug');

if (idx !== -1) {
  DEBUG.enable(arg[idx + 1] ?? '*');
}

const debug = DEBUG('es-node-runner:config');

interface BuildOptions {
  /** Entry point for bundling
   * @default 'src/index.ts' */
  entry: string;
  /** Sets the output directory for build operation.
   * @default 'node_modules/.cache/es-node-runner' */
  outdir: string;
  /** Sets the file name for bundled output. This is applicable only if bundle is true.
   * @default 'bundle.js' */
  outfile: string;
  /** Sets the target for generated code
   * @see https://esbuild.github.io/api/#target
   * @default 'node14' */
  target: string;
  format: 'iife' | 'cjs' | 'esm';
  /** Generates sourcemap
   * @default true */
  sourcemap: boolean;
}

interface WatchOptions {
  /** Path or list of paths to be watched for changes.
   * @example watch: 'src' or ['src', 'lib']
   * @default 'src' */
  watch: string | string[];
  /** Ignore list of files / paths from watching for changes.
   * @example ignore: ['**\/*.{test,spec}.ts'] */
  ignore?: string[];
}

interface SpawnOptions {
  /** Rebuild will be delayed by specified time (in millisecond).
   * @default delay: 1000 */
  delay: number;
  /** Restart sub process manually with terminal cmd
   * @example restartCmd: 'rst'
   * @default 'rs' */
  restartCmd: string;
  /** Clear the terminal output before restart
   * @default false */
  clearTerminal: boolean;
  /** To restart manually with cmd, set this to false. This is helpful
   * if we want to restart only when necessary.
   * @default true */
  autoRestart: boolean;
  /** Enable or disable logging
   * @default true */
  logging: boolean;
  /** Pass cli options to node executable
   * @default [] */
  args: string[];
}

type OverridableConfig = {
  /** Specifies options for building and rebuilding project */
  buildOptions: BuildOptions;
  /** Specifies options for configuring watcher */
  watchOptions: WatchOptions;
  /** Specifies options to be used while spawning a process */
  spawnOptions: SpawnOptions;
};

export type Config = {
  [K in keyof OverridableConfig]?: Partial<OverridableConfig[K]>;
};

// Checks whether the passed value is object and returns true if the condition satisfies.
const isObject = (obj: unknown) => {
  return Boolean(obj) && typeof obj === 'object' && !Array.isArray(obj);
};

/**
 * This method accepts two objects and overrides the target object by source object values
 * unless it is undefined or null values.
 * @param target object that will be overrided
 * @param source object that overrides the target object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const overrideTargetObj = <T extends Record<string, any>>(
  target: T,
  source: T
) => {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      if (isObject(source[key])) {
        overrideTargetObj(target[key], source[key]);
      } else {
        target[key] = source[key] ?? target[key];
      }
    }
  }
};

// Loads the user defined config from root of the cwd and overrides the
// default config values.
const loadConfig = async () => {
  debug('loading config');
  const cwd = process.cwd();

  // Default configuration
  const defaultConfig: OverridableConfig = {
    buildOptions: {
      entry: 'src/index.ts',
      outdir: 'node_modules/.cache/es-node-runner',
      outfile: 'bundle.js',
      target: 'node14',
      format: 'cjs',
      sourcemap: true,
    },
    watchOptions: {
      watch: 'src',
      ignore: undefined,
    },
    spawnOptions: {
      delay: 1000,
      restartCmd: 'rs',
      clearTerminal: false,
      autoRestart: true,
      logging: true,
      args: [],
    },
  };

  let userConfig: Config;

  try {
    debug('looking for es-node-runner.config file');
    // Try to load es-node-runner.config.js (esm or cjs)
    userConfig = (
      await import('file://' + resolve(cwd, 'es-node-runner.config.js'))
    ).default;
  } catch (error) {
    debug(
      'es-node-runner.config file not found...looking for config in package.json'
    );
    // If no es-node-runner.config file found, look for configs in package.json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const require = createRequire(import.meta.url);
    const packageJson = require(resolve(cwd, 'package.json'));

    // experimental import of json as modules
    // const packageJson = (await import('file://' + resolve(cwd, 'package.json'), {
    //   assert: {type: 'json'},
    // })).default;
    userConfig = packageJson['es-node-runner'] ?? {};
  }

  debug(
    Object.keys(userConfig).length === 0
      ? 'user config not found...using default config'
      : 'overriding default config with user config'
  );

  // Call the overrideTargetObj method with defaultConfig and userConfig to
  // override the config
  overrideTargetObj(defaultConfig, userConfig);
  debug('config loaded');

  return defaultConfig;
};

// Do not export loadConfig() as it will be called again
// when imported in each modules.
/** @internal */
export const {buildOptions, watchOptions, spawnOptions} = await loadConfig();
