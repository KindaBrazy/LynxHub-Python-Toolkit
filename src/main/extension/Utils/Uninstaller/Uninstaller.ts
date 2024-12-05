import {existsSync} from 'graceful-fs';

import {detectInstallationType} from '../PythonUtils';
import {uninstallCondaPython} from './Uninstaller_Conda';
import {uninstallOfficialPython} from './Uninstaller_Official';

export default async function uninstallPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    const installType = await detectInstallationType(pythonPath);

    // Verify the python installation exists
    if (!existsSync(pythonPath)) {
      return {
        success: false,
        message: `Python installation not found at ${pythonPath}`,
      };
    }

    // Handle different installation types
    switch (installType) {
      case 'conda':
        return await uninstallCondaPython(pythonPath);
      case 'official':
        return await uninstallOfficialPython(pythonPath);
      default:
        return {
          success: false,
          message: `Unknown installation type: ${installType}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      // @ts-ignore-next-line
      message: `Uninstallation failed: ${error.message}`,
    };
  }
}
