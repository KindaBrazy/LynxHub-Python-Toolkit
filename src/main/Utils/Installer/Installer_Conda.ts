import {BrowserWindow} from 'electron';
import {IPty} from 'node-pty';

import {pythonChannels} from '../../../cross/CrossExtTypes';
import {COMMAND_LINE_ENDING, determineShell} from '../ExtMainUtils';

export async function listAvailablePythons(pty: any): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const ptyProcess: IPty = pty.spawn(determineShell(), [], {});
    ptyProcess.write(`conda search python --info${COMMAND_LINE_ENDING}`);
    ptyProcess.write(`exit${COMMAND_LINE_ENDING}`);
    let output: string = '';

    ptyProcess.onData(data => {
      output += data;
    });

    ptyProcess.onExit(({exitCode}) => {
      if (exitCode === 0) {
        const versions: string[] = [];
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().startsWith('version')) {
            const result = line.split(':')[1];
            if (result) versions.unshift(result.trim());
          }
        }

        resolve([...new Set(versions)]);
      } else {
        reject(new Error('Unable to list available python versions.'));
      }
    });
  });
}

export const createCondaEnv = async (envName: string, pythonVersion: string, pty): Promise<void> => {
  return new Promise((resolve, reject) => {
    const window = BrowserWindow.getFocusedWindow()!;
    const command = `conda create --name ${envName} python=${pythonVersion} -y`;
    const ptyProcess: IPty = pty.spawn(determineShell(), [], {});

    ptyProcess.write(`${command}${COMMAND_LINE_ENDING}`);
    ptyProcess.write(`exit${COMMAND_LINE_ENDING}`);

    ptyProcess.onData(data => {
      const progressMatch = data.match(/\|\s+\d{1,3}%/);
      if (progressMatch) {
        const progress = progressMatch[0].match(/\d{1,3}/);
        if (progress) {
          window.webContents.send(pythonChannels.downloadProgressConda, progress[0]);
          console.log(`Progress: ${progress[0]}%`);
        }
      }
    });

    ptyProcess.onExit(({exitCode}) => {
      if (exitCode === 0) {
        console.log('Environment creation completed successfully!');
        resolve();
      } else {
        reject(`Environment creation failed with exit code ${exitCode}`);
      }
    });
  });
};

export function isCondaInstalled(pty): Promise<boolean> {
  return new Promise(resolve => {
    const ptyProcess: IPty = pty.spawn(determineShell(), [], {});
    ptyProcess.write(`conda --version${COMMAND_LINE_ENDING}`);
    ptyProcess.write(`exit${COMMAND_LINE_ENDING}`);

    let output = '';

    ptyProcess.onData((data: string) => {
      output += data;
    });

    ptyProcess.onExit(({exitCode}) => {
      if (exitCode === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
