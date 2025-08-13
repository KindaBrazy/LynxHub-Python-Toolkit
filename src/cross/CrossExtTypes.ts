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
  isLynxHubDefault: boolean;
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

export type IdPathType = {id: string; path: string};

export type RequirementData = {
  name: string;
  versionOperator: string | null;
  version: string | null;
  originalLine: string;
  autoFocus?: boolean;
};

export type DlProgressOfficial = {percentage: number; downloaded: number; total: number} | undefined;

export type FilterKeys = 'all' | 'updates' | 'prerelease' | 'major' | 'minor' | 'patch' | 'others';
export const pythonChannels = {
  removeSavedPython: 'remove-saved-python',
  addSavedPython: 'add-saved-python',

  changePythonVersion: 'change-python-version',

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
  installPackage: 'install-package',
  uninstallPackage: 'uninstall-package',

  getPackagesUpdateInfo: 'get-packages-update-info',
  getUpdatesReq: 'get-updates-req',
  updatePackage: 'update-package',
  updateAllPackages: 'update-all-packages',

  saveReqs: 'save-requirements',
  readReqs: 'read-requirements',

  setReqPath: 'set-requirements-path',
  getReqPath: 'get-requirements-path',
  findReq: 'find-req-file',

  locateAIVenv: 'locate-ai-venv',
  getAIVenv: 'get-ai-venv',
  addAIVenv: 'add-ai-venv',
  removeAIVenv: 'remove-ai-venv',
  removeAIVenvPath: 'remove-ai-venv-path',
  getAIVenvs: 'get-ai-venvs',
  findAIVenv: 'find-ai-venv',
  checkAIVenvEnabled: 'check-ai-venv-enable',

  readFile: 'read-file',

  getMaxRetry: 'get-max-retry',
  setMaxRetry: 'set-max-retry',

  getPkgDisplay: 'get-pkg-display',
  setPkgDisplay: 'set-pkg-display',

  getCacheStorageUsage: 'get-cache-storage-usage',
  setCacheStorageUsage: 'set-cache-storage-usage',

  replacePythonPath: 'ptoolkit-replace-python-path',

  errorGetVenvInfo: 'ptoolkit-errorGetVenvInfo',
};

export type PkgDisplayType = 'capitalize' | 'startCase' | 'default' | string;

export type PythonVenvSelectItem = {label: string; type: 'python' | 'venv'};
