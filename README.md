# es-node-runner

Transpiles Typescript or ES modules using esbuild and restarts the process automatically on change. Suitable for node development server.

## Usage

1. Install as devDependency using npm or yarn,</br>
   `npm i --save-dev es-node-runner`</br>
   or</br>
   `yarn add -D es-node-runner`

2. Add your config using one of the available options. Config will be searched for in this order,</br>

   - es-node-runner.config.js
   - es-node-runner.config.json
   - package.json

   There is no cascading of configs, so searching for config will end as soon as any of the above file is found. If no config is found, default config will be used.

3. Then, add `es-node-runner` to package.json scripts and run the script using npm or yarn as, `npm run <script_name>` or `yarn <script_name>`

## Configurations

List of options available for configuring es-node-runner are as follows,

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
},
```

Note: All options are optional.

For auto-completion,

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
