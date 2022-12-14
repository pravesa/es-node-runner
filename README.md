# es-node-runner

![npm](https://img.shields.io/npm/v/es-node-runner) ![NPM](https://img.shields.io/npm/l/es-node-runner) ![npm bundle size](https://img.shields.io/bundlephobia/min/es-node-runner)

Node runner that transpiles typescript or es modules using blazing fast ⚡ esbuild and restarts the process automatically on change. Suitable for node development server.

## Usage

1. Install as devDependency using npm or yarn,</br>

   ```sh
   npm i --save-dev es-node-runner

   # or

   yarn add -D es-node-runner
   ```

2. Add your config using one of the available formats. es-node-runner uses only one file if there are multiple configuration files in the root directory, The priority order is as follows,</br>

   - es-node-runner.config.js
   - es-node-runner.config.json
   - package.json

   If no configuration is found, then default config will be used.

3. Finally, add `es-node-runner` (only windows) or `enr` (cross-platform) to package.json scripts</br>

   ```json
   {
     "scripts": {
       "<script_name>": "es-node-runner" // or "enr"
     }
   }
   ```

   and run the script using npm or yarn as, `npm run <script_name>` or `yarn <script_name>`</br>

   > In v2.0.0, `enr` will be removed for the sake of cross-platform support. For instance, if someone contributing to your repo runs the above script in their unix env, it will output `command not found`.

## Configurations

Following options are available for configuring es-node-runner.

```ts
buildOptions: {
    // Entry point for bundling
    entry: string,
    // Sets the target for generated code
    target: string,
    // Generates sourcemap
    sourcemap: boolean,
},
watchOptions: {
    // Path or list of paths to be watched for changes.
    watch: string | string[],
    // Ignore list of files / paths from watching for changes.
    ignore: string | string[],
},
spawnOptions: {
    // Rebuild will be delayed by specified time (in millisecond).
    delay: number,
    // Restart sub process manually with terminal cmd
    restartCmd: string,
    // Clear the terminal output before restart
    clearTerminal: boolean,
    // To restart manually with cmd, set this to false. This is helpful if we want to restart only when necessary
    autoRestart: boolean,
    // Enable or disable logging
    logging: boolean,
},
```

Note: All options are optional.

#### For flexibility, prefer js config over json.

##### Example

```js
module.exports = {
  spawnOptions: {
    // This will disables the logging if debug is enabled
    logging: !process.env.DEBUG,
  },
};
```

#### For auto-completion, add `@type` jsdoc comment.

##### Example

```js
/**
 * @type {import('es-node-runner').Config}
 */
module.exports = {
  buildOptions: {
    entry: 'src/index.ts',
  },
  watchOptions: {
    watch: ['src'],
  },
};
```
