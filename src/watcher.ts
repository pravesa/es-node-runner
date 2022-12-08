/* eslint-disable no-console */
import {watch} from 'chokidar';
import {rebuild, initialBuild} from './transpiler';

export default () => {
  // Watch test folder for changes
  const watcher = watch('test', {
    ignoreInitial: true,
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
