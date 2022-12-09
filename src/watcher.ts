/* eslint-disable no-console */
import {watch} from 'chokidar';
import DEBUG from 'debug';
import {watchOptions} from './config';
import {rebuild, initialBuild} from './transpiler';

const debug = DEBUG('es-node-runner:watcher');

export default () => {
  // Initiate the watcher with array of paths to be watched and optional options
  // from the loaded config
  const watcher = watch(watchOptions.watch, {
    ignoreInitial: true,
    ignored: watchOptions.ignore,
  });

  watcher.on('ready', () => {
    debug('ready to watch for file changes');
    // Initiates the incremental build once the watcher is ready.
    initialBuild();

    watcher
      .on('change', (path) => {
        debug(`${path} was changed`);
        // Rebuild happens whenever the watching files changes
        rebuild();
      })
      .on('error', (error) => {
        debug(`watcher error - ${error}`);
        console.log(`error - ${error}`);
      });
  });
};
