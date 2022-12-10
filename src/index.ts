/* eslint-disable no-console */
import DEBUG from 'debug';
import {logger} from './utils';
import watch from './watcher';

const debug = DEBUG('es-node-runner:main');

function main() {
  watch();
}

process.on('exit', (code: number) => {
  debug(`process ${process.pid} exited with code ${code}`);
  const logLevel = code > 0 ? 'error' : 'log';
  logger[logLevel](`[es-node-runner] -->  Exited with code ${code}`);
});

process.on('SIGTERM', () => {
  debug('received termination signal');
  process.exit(0);
});

process.on('SIGINT', () => {
  debug('received interrupt signal');
  process.emit('SIGTERM');
});

main();
