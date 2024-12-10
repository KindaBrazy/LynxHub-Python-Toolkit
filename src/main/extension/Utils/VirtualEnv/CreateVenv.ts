import {spawnSync} from 'node:child_process';
import path from 'node:path';

import {VenvCreateOptions} from '../../../../cross/CrossExtensions';

/**
 * Creates a Python virtual environment.
 *
 * @param {VenvCreateOptions} options - The options for creating the virtual environment.
 * @param {string} options.pythonPath - The path to the Python executable to use.
 * @param {string} options.destinationFolder - The destination folder where the virtual environment will be created.
 * @param {string} options.venvName - The name of the virtual environment.
 * @returns {boolean} - True if the virtual environment was created successfully, false otherwise.
 */
export default function createPythonVenv(options: VenvCreateOptions): boolean {
  const {pythonPath, destinationFolder, venvName} = options;

  // Construct the full path to the virtual environment
  const venvPath = path.join(destinationFolder, venvName);

  // Run the command to create the virtual environment
  const result = spawnSync(pythonPath, ['-m', 'venv', venvPath], {
    stdio: 'inherit', // Show output in the console
  });

  // Check for errors
  if (result.error) {
    console.error(`Error creating virtual environment: ${result.error.message}`);
    return false;
  }

  if (result.status !== 0) {
    console.error(`Error creating virtual environment. Process exited with code ${result.status}`);
    return false;
  }

  console.log(`Virtual environment created successfully at: ${venvPath}`);
  return true;
}
