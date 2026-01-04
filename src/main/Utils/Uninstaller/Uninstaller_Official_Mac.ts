import {exec} from 'child_process';
import {existsSync} from 'graceful-fs';
import {promisify} from 'util';

const execAsync = promisify(exec);

/** Escapes single quotes in a string for safe use in shell commands */
function escapeForShell(str: string): string {
  return str.replace(/'/g, "'\\''");
}

/**
 * Uninstalls Python on macOS.
 * Handles both official installer (Python.framework) and Homebrew installations.
 */
export async function uninstallMacPython(pythonExecutablePath: string): Promise<{success: boolean; message: string}> {
  try {
    if (!pythonExecutablePath) {
      return {
        success: false,
        message: 'Invalid Python executable path provided.',
      };
    }

    // Determine installation type based on path
    if (pythonExecutablePath.includes('/Library/Frameworks/Python.framework')) {
      return await uninstallOfficialMacPython(pythonExecutablePath);
    } else if (pythonExecutablePath.includes('/opt/homebrew') || pythonExecutablePath.includes('/usr/local/Cellar')) {
      return await uninstallHomebrewPython(pythonExecutablePath);
    } else {
      return {
        success: false,
        message: 'Unknown Python installation type. Manual removal may be required.',
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `Failed to uninstall Python: ${e.message}`,
    };
  }
}

async function uninstallOfficialMacPython(pythonExecutablePath: string): Promise<{success: boolean; message: string}> {
  try {
    // Get Python version from path (e.g., /Library/Frameworks/Python.framework/Versions/3.11/bin/python3)
    const versionMatch = pythonExecutablePath.match(/Versions\/(\d+\.\d+)/);
    if (!versionMatch) {
      return {
        success: false,
        message: 'Could not determine Python version from path.',
      };
    }

    const version = versionMatch[1];
    const frameworkPath = `/Library/Frameworks/Python.framework/Versions/${version}`;
    const applicationsPath = `/Applications/Python ${version}`;

    // Check if framework exists
    if (!existsSync(frameworkPath)) {
      return {
        success: false,
        message: `Python ${version} framework not found at expected location.`,
      };
    }

    // Remove framework directory and Applications folder using osascript for admin privileges
    const removeCommands = [
      `rm -rf '${escapeForShell(frameworkPath)}'`,
      `rm -rf '${escapeForShell(applicationsPath)}'`,
      // Remove symlinks from /usr/local/bin
      `find /usr/local/bin -lname '*Python.framework/Versions/${version}*' -delete 2>/dev/null || true`,
    ].join(' && ');

    const script = `do shell script "${removeCommands}" with administrator privileges`;
    await execAsync(`osascript -e '${script}'`);

    return {
      success: true,
      message: `Successfully removed Python ${version} installation.`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Failed to uninstall official Python: ${e.message}`,
    };
  }
}

async function uninstallHomebrewPython(pythonExecutablePath: string): Promise<{success: boolean; message: string}> {
  try {
    // Get the formula name from the path
    // e.g., /opt/homebrew/opt/python@3.11/bin/python3 -> python@3.11
    const formulaMatch = pythonExecutablePath.match(/python@?[\d.]*/i);
    if (!formulaMatch) {
      return {
        success: false,
        message: 'Could not determine Homebrew formula name.',
      };
    }

    const formula = formulaMatch[0];

    // Determine brew path based on architecture
    const brewPath = existsSync('/opt/homebrew/bin/brew') ? '/opt/homebrew/bin/brew' : '/usr/local/bin/brew';

    if (!existsSync(brewPath)) {
      return {
        success: false,
        message: 'Homebrew not found. Cannot uninstall Homebrew-managed Python.',
      };
    }

    await execAsync(`${brewPath} uninstall --ignore-dependencies ${formula}`);

    return {
      success: true,
      message: `Successfully removed Homebrew Python (${formula}).`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Failed to uninstall Homebrew Python: ${e.message}`,
    };
  }
}
