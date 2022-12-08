/* eslint-disable no-console */
import {watch} from 'chokidar';
import {watchOptions} from './config';
import {rebuild, initialBuild} from './transpiler';

export default () => {
  // Initiate the watcher with array of paths to be watched and optional options
  // from the loaded config
  const watcher = watch(watchOptions.watch, {
    ignoreInitial: true,
    ignored: watchOptions.ignore,
  });

  watcher.on('ready', () => {
    // Initiates the incremental build once the watcher is ready.
    initialBuild();

    watcher
      .on('change', (path) => {
        console.log(`${path} was changed`);
        // Rebuild happens whenever the watching files changes
        rebuild();
      })
      .on('error', (error) => {
        console.log(`error - ${error}`);
      });
  });
};
