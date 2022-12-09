import {resolve} from 'path';
import DEBUG from 'debug';

const debug = DEBUG('es-node-runner:config');

interface BuildOptions {
  entry: string;
  target: string;
  sourcemap: boolean;
}

interface WatchOptions {
  watch: string | string[];
  ignore?: string[];
}

type OverridableConfig = {
  buildOptions: BuildOptions;
  watchOptions: WatchOptions;
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
const loadConfig = () => {
  debug('loading config');
  const cwd = process.cwd();

  // Default configuration
  const defaultConfig: OverridableConfig = {
    buildOptions: {
      entry: 'src/index.ts',
      target: 'node14',
      sourcemap: true,
    },
    watchOptions: {
      watch: 'src',
      ignore: undefined,
    },
  };

  let userConfig: Config;

  try {
    debug('looking for es-node-runner.config file');
    // Try to load es-node-runner.config.{js,json}
    userConfig = require(resolve(cwd, 'es-node-runner.config'));
  } catch (error) {
    debug(
      'es-node-runner.config file not found...looking for config in package.json'
    );
    // If no es-node-runner.config file found, look for configs in package.json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJson = require(resolve(cwd, 'package.json'));

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
export const {buildOptions, watchOptions} = loadConfig();
