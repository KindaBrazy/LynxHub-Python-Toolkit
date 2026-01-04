import {platform} from 'os';

import {uninstallLinuxPython} from './Uninstaller_Official_Linux';
import {uninstallMacPython} from './Uninstaller_Official_Mac';
import {uninstallWindowsPython} from './Uninstaller_Official_Win';

export async function uninstallOfficialPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  const os = platform();

  try {
    switch (os) {
      case 'win32':
        return await uninstallWindowsPython(pythonPath);
      case 'darwin':
        return await uninstallMacPython(pythonPath);
      case 'linux':
        return await uninstallLinuxPython(pythonPath);
      default:
        return {
          success: false,
          message: `Unsupported operating system: ${os}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Uninstallation failed: ${err.message}`,
    };
  }
}
