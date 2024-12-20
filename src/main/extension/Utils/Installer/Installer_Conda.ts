import {exec, spawn} from 'node:child_process';

import {BrowserWindow} from 'electron';

import {pythonChannels} from '../../../../cross/Extension/CrossExtTypes';

/**
 * List all available Python versions in Conda for Windows.
 * @returns Promise<string[]> - A promise that resolves with an array of available Python versions.
 */
export async function listAvailablePythons(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('conda search python --info', (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Error output: ${stderr}`);
        return;
      }

      const versions: string[] = [];
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().startsWith('version')) {
          const result = line.split(':')[1];
          if (result) versions.unshift(result.trim());
        }
      }

      // Remove duplicates and resolve
      resolve([...new Set(versions)]);
    });
  });
}

/**
 * Create a new Conda environment with the specified name and install the specified Python version,
 * logging progress by percentage.
 * @param envName - The name of the new Conda environment.
 * @param pythonVersion - The Python version to install in the new environment (e.g., "3.9.7").
 * @returns Promise<void> - Resolves when the environment is created and Python is installed.
 */
export const createCondaEnv = async (envName: string, pythonVersion: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const window = BrowserWindow.getFocusedWindow()!;
    const command = `conda create --name ${envName} python=${pythonVersion} -y`;
    const process = spawn(command, {shell: true});

    process.stdout.on('data', data => {
      const output = data.toString();
      console.log(output); // Optional: log raw output for debugging

      // Extract progress percentage from the output using regex
      const progressMatch = output.match(/\|\s+\d{1,3}%/);
      if (progressMatch) {
        const progress = progressMatch[0].match(/\d{1,3}/);
        if (progress) {
          window.webContents.send(pythonChannels.downloadProgressConda, progress[0]);
          console.log(`Progress: ${progress[0]}%`);
        }
      }
    });

    process.stderr.on('data', data => {
      console.error(`Error output: ${data.toString()}`);
    });

    process.on('close', code => {
      if (code === 0) {
        console.log('Environment creation completed successfully!');
        resolve();
      } else {
        reject(`Environment creation failed with exit code ${code}`);
      }
    });
  });
};

export function isCondaInstalled(): Promise<boolean> {
  return new Promise(resolve => {
    exec('conda --version', (error, _stdout, stderr) => {
      if (error || stderr) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
