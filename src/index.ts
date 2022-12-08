/* eslint-disable no-console */
import watch from './watcher';

function main() {
  watch();
}

process.on('exit', (code: number) => {
  console.log(`process ${process.pid} exited with code ${code}`);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.emit('SIGTERM');
});

main();
