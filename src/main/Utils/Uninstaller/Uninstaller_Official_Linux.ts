import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

export async function uninstallLinuxPython(pythonExecutablePath: string) {
  try {
    if (!pythonExecutablePath) {
      return {
        success: false,
        message: `Invalid Python executable path provided.`,
      };
    }

    const {stdout} = await execAsync(`"${pythonExecutablePath}" --version`);
    const versionMatch = stdout.match(/Python (\d+\.\d+)/);
    if (!versionMatch) {
      return {
        success: false,
        message: `Could not determine Python version from output.`,
      };
    }

    const pythonVersion = versionMatch[1];
    const pythonPackageName = `python${pythonVersion}`;

    await execAsync(`pkexec apt purge ${pythonPackageName} -y`);

    return {
      success: true,
      message: 'Successfully removed Python installation.',
    };
  } catch (e) {
    return {
      success: false,
      message: `Failed to uninstall Python.`,
    };
  }
}
