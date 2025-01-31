import {existsSync} from 'graceful-fs';

import {detectInstallationType} from '../PythonUtils';
import {uninstallCondaPython} from './Uninstaller_Conda';
import {uninstallOfficialPython} from './Uninstaller_Official';

export default async function uninstallPython(pythonPath: string, pty): Promise<{success: boolean; message: string}> {
  try {
    const installType = await detectInstallationType(pythonPath);

    if (!existsSync(pythonPath)) {
      return {
        success: false,
        message: `Python installation not found at ${pythonPath}`,
      };
    }

    switch (installType) {
      case 'conda':
        return await uninstallCondaPython(pythonPath, pty);
      case 'official':
      case 'other':
        return await uninstallOfficialPython(pythonPath);
      default:
        return {
          success: false,
          message: `Unknown installation type: ${installType}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Uninstallation failed: ${err.message}`,
    };
  }
}
