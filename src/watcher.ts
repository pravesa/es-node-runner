/* eslint-disable no-console */
import {watch} from 'chokidar';
import DEBUG from 'debug';
import {performance} from 'perf_hooks';
import {spawnOptions, watchOptions} from './config';
import {rebuild, initialBuild} from './transpiler';
import {logger} from './utils';

const debug = DEBUG('es-node-runner:watcher');

const {delay, restartCmd, clearTerminal, autoRestart} = spawnOptions;

// Clears the terminal output
function clearTerminalOutput() {
  process.stdout.write('\x1Bc\x1B[3J');
  debug(`Terminal output cleared`);
}

function restartSubProcess() {
  // Mark the sub process start timestamp
  global.SUB_PROCESS_RESTART_TIME = performance.now();

  // Rebuild happens whenever the watching files changes
  rebuild();
}

function restartOnChange(action: string) {
  debug(`${action}`);

  // Clear the terminal on restart, if clearTerminal is set to true
  if (clearTerminal === true) {
    clearTerminalOutput();
  }

  logger.alert(
    `\n[Watcher]: ${action}\n` + `Sub process will restart after ${delay} ms\n`
  );

  restartSubProcess();
}

// Read user cmd and take respective action
process.stdin.on('data', (data) => {
  const cmd = data.toString().trimEnd();

  switch (cmd) {
    // Matches restart cmd
    case restartCmd:
      logger.alert(`\nreceived '${cmd}' cmd, restarting sub process...\n`);
      restartSubProcess();
      break;
    // Matches clear cmd
    case 'clear':
      clearTerminalOutput();
      break;
    default:
      logger.warn(`unrecognized '${cmd}' cmd`);
      break;
  }
});

// If autoRestart is false, then watcher will not be enabled.
export default autoRestart === false
  ? () => initialBuild()
  : () => {
      // Initiate the watcher with array of paths to be watched and optional options
      // from the loaded config
      const watcher = watch(watchOptions.watch, {
        ignoreInitial: true,
        ignored: watchOptions.ignore,
      });

      watcher.on('ready', () => {
        debug('ready to watch for file changes');

        logger.alert('[Watcher]: Watching for file changes\n');
        // Initiates the incremental build once the watcher is ready.
        initialBuild();

        watcher
          .on('change', (path) => {
            restartOnChange(`${path} was changed`);
          })
          .on('error', (error) => {
            debug(`watcher error - ${error}`);
            console.log(`error - ${error}`);
          });
      });
    };
