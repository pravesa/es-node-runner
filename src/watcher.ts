/* eslint-disable no-console */
import {watch} from 'chokidar';
import DEBUG from 'debug';
import {spawnOptions, watchOptions} from './config';
import {rebuild, initialBuild} from './transpiler';
import {logger} from './utils';

const debug = DEBUG('es-node-runner:watcher');

const {delay} = spawnOptions;

export default () => {
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
        debug(`${path} was changed`);
        logger.alert(
          `\n[Watcher]: ${path} was changed\n` +
            `Server will restart after ${delay} ms\n`
        );
        // Rebuild happens whenever the watching files changes
        rebuild();
      })
      .on('error', (error) => {
        debug(`watcher error - ${error}`);
        console.log(`error - ${error}`);
      });
  });
};
