/* eslint-disable no-console */
import {watch} from 'chokidar';

export default () => {
  const watcher = watch('src', {
    ignoreInitial: true,
  });

  watcher.on('ready', () => {
    watcher
      .on('change', (path) => {
        console.log(`${path} was changed`);
      })
      .on('error', (error) => {
        console.log(`error - ${error}`);
      });
  });
};
