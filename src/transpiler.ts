import {build, BuildResult} from 'esbuild';
import run from './runner';
import resolveNodeModulePaths from './utils';

let buildResult: BuildResult;

// Transpiles and bundles the typescript and es module at the given default entry point
// and output the bundled file at specified path.
const initialBuild = async () => {
  const outfile = './node_modules/.cache/esbuild/server.js';

  buildResult = await build({
    // For manual testing -> 'test/example/src/index.ts'
    entryPoints: ['test/example/src/index.ts'],
    allowOverwrite: true,
    bundle: true,
    platform: 'node',
    target: 'node14',
    incremental: true,
    sourcemap: true,
    external: resolveNodeModulePaths(),
    outfile: outfile,
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
