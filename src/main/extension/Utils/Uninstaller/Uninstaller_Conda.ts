import {exec} from 'node:child_process';
import {basename} from 'node:path';
import {promisify} from 'node:util';

import {IPty} from 'node-pty';

import {COMMAND_LINE_ENDING, determineShell} from '../ExtMainUtils';

const execAsync = promisify(exec);

export async function uninstallCondaPython(pythonPath: string, pty): Promise<{success: boolean; message: string}> {
  return new Promise(async resolve => {
    try {
      const ptyProcess: IPty = pty.spawn(determineShell(), [], {});
      const envName = await getCondaEnvName(pythonPath);

      ptyProcess.write(`conda env remove -n ${envName} -y${COMMAND_LINE_ENDING}`);
      ptyProcess.write(`exit${COMMAND_LINE_ENDING}`);

      ptyProcess.onExit(({exitCode}) => {
        if (exitCode === 0) {
          resolve({
            success: true,
            message: `Successfully removed conda environment ${envName}`,
          });
        } else {
          resolve({
            success: false,
            message: `Failed to remove conda environment.`,
          });
        }
      });
    } catch (err: any) {
      resolve({
        success: false,
        message: `Failed to remove conda environment: ${err.message}`,
      });
    }
  });
}

export async function getCondaEnvName(pythonPath: string): Promise<string> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix.split('/')[-1])"`);
    return basename(stdout.trim());
  } catch (err: any) {
    throw new Error(`Failed to get conda environment name: ${err.message}`);
  }
}
