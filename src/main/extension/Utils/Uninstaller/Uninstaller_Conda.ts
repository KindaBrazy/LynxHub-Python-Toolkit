import {exec} from 'node:child_process';
import {promisify} from 'node:util';

const execAsync = promisify(exec);

export async function uninstallCondaPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    const envName = await getCondaEnvName(pythonPath);
    await execAsync(`conda env remove -n ${envName} -y`);
    return {
      success: true,
      message: `Successfully removed conda environment ${envName}`,
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore-next-line
      message: `Failed to remove conda environment: ${error.message}`,
    };
  }
}

async function getCondaEnvName(pythonPath: string): Promise<string> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix.split('/')[-1])"`);
    return stdout.trim();
  } catch (error) {
    // @ts-ignore-next-line
    throw new Error(`Failed to get conda environment name: ${error.message}`);
  }
}
