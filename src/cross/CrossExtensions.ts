export type PythonInstallation = {
  version: string;
  installationType: 'official' | 'conda' | 'other';
  architecture: '32bit' | '64bit';
  installPath: string;
  condaName: string;
  installFolder: string;
  pipPath?: string;
  packages: number;
  venvPaths: string[];
  sitePackagesPath: string;
  isDefault: boolean;
};

export type PythonVenvs = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  pythonPath: string;
  folder: string;
};

export type PythonVersion = {
  version: string;
  url: string;
};

export type VenvCreateOptions = {
  pythonPath: string;
  destinationFolder: string;
  venvName: string;
};

export type VenvInfo = {
  pythonVersion: string;
  sitePackagesCount: number;
  name: string;
  pythonPath: string;
  folder: string;
};

export type SitePackages_Info = {
  name: string;
  version: string;
};

export type PackageInfo = SitePackages_Info & {
  updateVersion?: string;
};

export const pythonChannels = {
  getAvailableConda: 'get-available-conda-pythons',
  downloadProgressConda: 'download-conda-python-progress',
  installConda: 'install-conda-python',
  isCondaInstalled: 'is-conda-installed',

  getInstalledPythons: 'get-installed-pythons',
  uninstallPython: 'uninstall-python',
  setDefaultPython: 'set-default-python',

  getAvailableOfficial: 'get-available-pythons',
  downloadProgressOfficial: 'download-python-progress',
  installOfficial: 'install-official-python',

  createVenv: 'create-venv',
  getVenvs: 'get-venvs',
  locateVenv: 'locate-venv',

  getPackagesInfo: 'get-packages-info',
  getPackagesUpdateInfo: 'get-packages-update-info',
  updatePackage: 'update-package',
};
