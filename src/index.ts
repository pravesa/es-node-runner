#!/usr/bin/env node

/* eslint-disable no-console */
import DEBUG from 'debug';
import {performance} from 'perf_hooks';
import {dispose} from './transpiler.js';
import {formatElapsedTime, logger} from './utils/index.js';
import watch from './watcher.js';

const debug = DEBUG('es-node-runner:main');

declare global {
  // eslint-disable-next-line no-var
  var PROCESS_START_TIME: number, SUB_PROCESS_RESTART_TIME: number;
}

// Mark the entry timestamp
global.PROCESS_START_TIME = performance.now();

function main() {
  try {
    watch();
  } catch (error) {
    logger.info(
      '\ntry cli option --debug with optional comma(,) separated namespace for enabling debugging.\n'
    );
    throw error;
  }
}

process.on('exit', (code: number) => {
  debug(`process ${process.pid} exited with code ${code}`);

  const logLevel = code > 0 ? 'error' : 'log';

  logger[logLevel](
    `\n[es-node-runner] -->  Exited with code ${code}\n` +
      `Total runtime    -->  ${formatElapsedTime(
        performance.now() - global.PROCESS_START_TIME
      )}`
  );
});

process.on('SIGTERM', () => {
  // Dispose the build cache on termination
  dispose();
  debug('received termination signal');
  process.exit(0);
});

process.on('SIGINT', () => {
  debug('received interrupt signal');
  process.emit('SIGTERM');
});

main();
