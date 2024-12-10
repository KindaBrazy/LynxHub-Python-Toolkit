export type PythonInstallation = {
  version: string;
  installationType: 'official' | 'conda' | 'other';
  architecture: '32bit' | '64bit';
  installPath: string;
  condaName: string;
  installFolder: string;
  pipPath?: string;
  venvPaths: string[];
  sitePackagesPath: string;
  isDefault: boolean;
};

export type UninstallResult = {
  success: boolean;
  message: string;
};

export type PythonVersion = {
  version: string;
  url: string;
};

export const pythonChannels = {
  getAvailableConda: 'get-available-conda-pythons',
  downloadProgressConda: 'download-conda-python-progress',
  installConda: 'install-conda-python',
  isCondaInstalled: 'is-conda-installed',

  getAvailableOfficial: 'get-available-pythons',
  downloadProgressOfficial: 'download-python-progress',
  installOfficial: 'install-official-python',
};
