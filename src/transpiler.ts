import {build, BuildResult} from 'esbuild';
import DEBUG from 'debug';
import {buildOptions} from './config';
import {restart, run} from './runner';
import resolveNodeModulePaths from './utils';

const debug = DEBUG('es-node-runner:transpiler');

let buildResult: BuildResult;

// Transpiles and bundles the typescript and es module at the given default entry point
// and output the bundled file at specified path.
const initialBuild = async () => {
  debug('starting initial build');

  const {entry, ...options} = buildOptions;
  const outfile = './node_modules/.cache/esbuild/index.js';

  // Call the build with loaded config
  buildResult = await build({
    entryPoints: [entry],
    allowOverwrite: true,
    bundle: true,
    platform: 'node',
    incremental: true,
    external: resolveNodeModulePaths(),
    outfile: outfile,
    ...options,
  });

  debug('initial build completed');

  // Spawn a child process (eg: server) once the initial build finishes.
  run([outfile]);
};

// Rebuild the entry points as many times with the same buildoptions
const rebuild = async () => {
  debug('starting rebuild');

  if (buildResult.rebuild) {
    await buildResult.rebuild();
  }

  debug('rebuild completed');
  // Restart the process that was spawned after the initial build
  restart();
};

// Clear the incremental build cache on process exit
const dispose = () => {
  debug('disposing build cache');
  buildResult.rebuild?.dispose();
  debug('build cache disposed');
};

export {initialBuild, rebuild, dispose};
