/* eslint-disable no-console */
import {spawn} from 'cross-spawn';

/**
 * The run method by default spawns a new node process using the passed arguments
 * and parent process's environment variables.
 * @param spawnArgs array of spawn arguments
 */
function run(spawnArgs: string[]) {
  const subProcess = spawn('node', spawnArgs, {
    stdio: [process.stdin, process.stdout, process.stderr],
    env: {
      ...process.env,
    },
  });

  // Exit the process with code 1 for any signal received during child process creation.
  if (subProcess.signalCode) {
    console.log(
      'The command execution failed because the process exited too early.'
    );

    if (subProcess.signalCode === 'SIGKILL') {
      console.log(
        'This probably means the system ran out of memory or someone called "kill -9" on the process.\n'
      );
    } else if (subProcess.signalCode === 'SIGTERM') {
      console.log(
        'Someone might have called `kill` or `killall`, or the system could be shutting down.\n'
      );
    }
    process.exit(1);
  }

  // Listens for error event in subprocess
  subProcess.on('error', (error: NodeJS.ErrnoException) => {
    console.log(`[Error]: ${error.code} - ${error.message}\n`);

    // Exit the process for file not found error
    if (error.code === 'ENOENT') {
      process.exit(1);
    } else {
      throw error;
    }
  });

  // Listens for an exit event
  subProcess.once('exit', (code: number) => {
    if (code > 0) {
      console.log(`server exited with code ${code}`);
    }
  });
}

export default run;
