/* eslint-disable no-console */
import {ChildProcess, exec, execSync} from 'child_process';
import {spawn} from 'cross-spawn';
import DEBUG from 'debug';
import {logger} from './utils/index.js';

const debug = DEBUG('es-node-runner:runner');

let child: ChildProcess | null, reRun: () => void;

// Sets true if the platform is windows
const isWin = process.platform === 'win32';

/**
 * The run method by default spawns a new node process using the passed arguments
 * and parent process's environment variables.
 * @param spawnArgs array of spawn arguments
 */
function run(this: unknown, spawnArgs: string[]) {
  debug('spawning new sub process');
  const subProcess = spawn('node', spawnArgs, {
    stdio: [process.stdin, process.stdout, process.stderr],
    env: {
      ...process.env,
    },
  });

  // Bind to run() for invoking the method from restart
  reRun = run.bind(this, spawnArgs);

  // Exit the process with code 1 for any signal received during child process creation.
  if (subProcess.signalCode) {
    debug(`received '${subProcess.signalCode}' signal in sub process`);
    logger.error(
      'The command execution failed because the process exited too early.'
    );

    if (subProcess.signalCode === 'SIGKILL') {
      logger.error(
        'This probably means the system ran out of memory or someone called "kill -9" on the process.\n'
      );
    } else if (subProcess.signalCode === 'SIGTERM') {
      logger.error(
        'Someone might have called `kill` or `killall`, or the system could be shutting down.\n'
      );
    }
    debug('exiting sub process with code 1');
    process.exit(1);
  }

  subProcess.on('spawn', () => {
    debug(
      child?.pid !== subProcess.pid
        ? 'sub process spawned'
        : 'sub process respawned'
    );
    child = subProcess;
  });

  // Listens for error event in sub process
  subProcess.on('error', (error: NodeJS.ErrnoException) => {
    debug(`error occurred in sub process ${subProcess.pid}`);
    logger.error(`[Error]: ${error.code} - ${error.message}\n`);

    // Exit the process for file not found error
    if (error.code === 'ENOENT') {
      debug('exiting sub process with code 1');
      process.exit(1);
    } else {
      throw error;
    }
  });

  // Listens for an exit event
  subProcess.once('exit', (code: number) => {
    debug(`sub process ${subProcess.pid} exited with code ${code}`);
    child = null;
    if (code > 0) {
      logger.error(`Sub process exited with code ${code}\n`);
      // Exit parent process if the exit code is not '0'
      process.exit(0);
    }
  });
}

// The stop() method implements OS-specific kill commands to terminate all child processes
// given it's parent process pid.
function stop() {
  // On successful termination, status will be assigned with number 48 (ASCII Code) for 0
  let status = -1;

  if (child && child.pid) {
    debug('terminating child processes');

    // Windows specific kill implementation
    if (isWin) {
      debug('executing windows kill cmd');
      try {
        // Here, the cmd is executed to terminate the process gracefully. It is recommended to use powershell's CIM cmdlet over
        // wmic cmd - "wmic process where (ParentProcessId=${child.pid}) get ProcessId 2> nul"
        // Learn more: https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/07-working-with-wmi?view=powershell-7.3
        const terminationStatus = execSync(
          `powershell "(Invoke-CimMethod -InputObject (Get-CimInstance Win32_Process | ` +
            `Where-Object { $_.ParentProcessId -eq ${child.pid} }) -MethodName Terminate).ReturnValue"`
        );
        // Read the buffer at index 0 for termination status from powershell cmd
        status = terminationStatus.readUInt8(0);
        debug('child processes killed gracefully');
      } catch (error) {
        debug('terminating child processes forcefully');
        try {
          // Taskkill cmd will terminate the process forcefully if the graceful termination fails.
          exec(`TASKKILL /PID ${child.pid} /F /T`);
          status = 48;
        } catch (error) {
          logger.error(
            'Could not terminate cleanly. One or more child processes were still running. ' +
              `More info : ${error}\n`
          );
          process.exit(1);
        }
      }
      // Non-windows specific kill implementation
    } else {
      debug('executing non-windows kill cmd');
      try {
        // This one uses 'ps' cmd available in non-windows platform to terminate the process gracefully.
        // Alternate approach is to use "pstree -p ${parent.pid} -T | grep -oe '([0-9]*)' | grep -oP '[0-9]+'"
        // With the above cmd, we get the provided parent pid as first element among the list of processes.
        const buffer = execSync(
          `ps --ppid ${child.pid} -o pid | grep -oP '[0-9]+' | xargs -r`
        );

        const pids = buffer.toString().match(/[0-9]+/g);

        // Send termination signal to each child processes with kill cmd.
        if (Array.isArray(pids)) {
          pids.forEach((pid) => exec(`kill -TERM ${pid}`));
        }

        // Finally, kill the child process that spawned all other processes.
        child.kill();

        status = 48;
        debug('child processes killed gracefully');
      } catch (error) {
        logger.error(
          'Could not terminate cleanly. One or more child processes were still running. ' +
            `More info : ${error}\n`
        );
        process.exit(1);
      }
    }
  } else {
    status = 48;
  }
  return status;
}

// This method restarts the node process by first invoking stop() and
// then reRun() will be invoked when the returned value from stop is 48.
function restart() {
  debug('restarting process after rebuild');
  // Stop returns ascii char 48 for successful termination
  if (stop() === 48) {
    reRun();
  } else {
    debug('could not restart process');
    logger.error('Could not restart process\n');
  }
}

export {run, restart};
