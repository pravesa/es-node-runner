import {build, BuildResult} from 'esbuild';
import DEBUG from 'debug';
import path from 'path';
import {writeFileSync} from 'fs';
import {performance} from 'perf_hooks';
import {buildOptions, spawnOptions} from './config.js';
import {restart, run} from './runner.js';
import {debounce, logger, resolveNodeModulePaths} from './utils/index.js';

const debug = DEBUG('es-node-runner:transpiler');
const lightning = process.stdout.isTTY ? '\u26A1' : '';

let buildResult: BuildResult;

// Transpiles and bundles the typescript and es module at the given default entry point
// and output the bundled file at specified path.
const initialBuild = async () => {
  debug('starting initial build');
  const BUILD_START_TIME = performance.now();

  const {entry, outdir, outfile, ...options} = buildOptions;
  const output = path.join(outdir, outfile);

  try {
    // Call the build with loaded config
    buildResult = await build({
      entryPoints: [entry],
      allowOverwrite: true,
      bundle: true,
      platform: 'node',
      incremental: true,
      external: resolveNodeModulePaths(),
      outfile: output,
      ...options,
    });

    logger.info(
      `[Esbuild]: ${lightning} Build completed in ${(
        performance.now() - BUILD_START_TIME
      ).toFixed(2)} ms\n`
    );

    debug('initial build completed');
  } catch (error) {
    debug('initial build failed');
    throw error;
  }

  if (options.format === 'esm' && outdir.includes('node_modules')) {
    writeFileSync(
      path.join(outdir, 'package.json'),
      JSON.stringify({type: 'module'}),
      {encoding: 'utf-8'}
    );
  }

  // Spawn a child process (eg: server) once the initial build finishes.
  run([output]);

  logger.success(
    `[Sub Process]: Spawned in ${(
      performance.now() - global.PROCESS_START_TIME
    ).toFixed(2)} ms\n`
  );
};

// Rebuild can be called to build the project with same build options as many times.
// Additionally, this function is passed to the debounce function for avoiding repeated
// rebuild in short time. It has default delay of 1000 ms and can be configured.
const rebuild = debounce(
  async () => {
    debug('starting rebuild');
    const REBUILD_START_TIME = performance.now();

    if (buildResult.rebuild) {
      try {
        await buildResult.rebuild();

        logger.info(
          `[Esbuild]: ${lightning} Rebuild completed in ${(
            performance.now() - REBUILD_START_TIME
          ).toFixed(2)} ms\n`
        );

        debug('rebuild completed');
      } catch (error) {
        debug('rebuild failed');
        throw error;
      }
    }
    // Restart the process that was spawned after the initial build
    restart();

    logger.success(
      `[Sub Process]: Respawned in ${(
        performance.now() - global.SUB_PROCESS_RESTART_TIME
      ).toFixed(2)} ms\n`
    );
  },
  spawnOptions.autoRestart === false ? 0 : spawnOptions.delay
);

// Clear the incremental build cache on process exit
const dispose = () => {
  debug('disposing build cache');
  buildResult.rebuild?.dispose();
  debug('build cache disposed');
  logger.info('[Esbuild]: Build cache disposed\n');
};

export {initialBuild, rebuild, dispose};
