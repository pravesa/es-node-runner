/* eslint-disable no-console */
import DEBUG from 'debug';
import watch from './watcher';

const debug = DEBUG('es-node-runner:main');

function main() {
  watch();
}

process.on('exit', (code: number) => {
  debug(`process ${process.pid} exited with code ${code}`);
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
