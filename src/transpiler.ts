import {build, BuildResult} from 'esbuild';
import {buildOptions} from './config';
import run from './runner';
import resolveNodeModulePaths from './utils';

let buildResult: BuildResult;

// Transpiles and bundles the typescript and es module at the given default entry point
// and output the bundled file at specified path.
const initialBuild = async () => {
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

  // Spawn a child process (eg: server) once the initial build finishes.
  run([outfile]);
};

// Rebuild the entry points as many times with the same buildoptions
const rebuild = async () => {
  if (buildResult.rebuild) {
    await buildResult.rebuild();
  }
};

// Clear the incremental build cache on process exit
const dispose = () => {
  buildResult.rebuild?.dispose();
};

export {initialBuild, rebuild, dispose};
