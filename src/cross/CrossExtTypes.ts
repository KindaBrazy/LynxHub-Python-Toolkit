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

export type PackageUpdate = {name: string; targetVersion?: string};

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

  locatePython: 'ptoolkit-locate-python',

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

  getAssociates: 'get-ai-venvs',
  addAssociate: 'add-ai-venv',
  removeAssociate: 'remove-ai-venv',
  removeAssociatePath: 'remove-ai-venv-path',
  getExePathAssociate: 'get-exe-path-associate',

  findAIVenv: 'find-ai-venv',

  readFile: 'read-file',

  getMaxRetry: 'get-max-retry',
  setMaxRetry: 'set-max-retry',

  getMaxConcurrent: 'get-max-concurrent',
  setMaxConcurrent: 'set-max-concurrent',

  getPkgDisplay: 'get-pkg-display',
  setPkgDisplay: 'set-pkg-display',

  getCacheStorageUsage: 'get-cache-storage-usage',
  setCacheStorageUsage: 'set-cache-storage-usage',

  getCardStartCommand: 'get-card-start-command',
  setCardStartCommand: 'set-card-start-command',

  replacePythonPath: 'ptoolkit-replace-python-path',

  errorGetVenvInfo: 'ptoolkit-errorGetVenvInfo',

  updateCheckProgress: 'ptoolkit-update-check-progress',

  abortUpdateCheck: 'ptoolkit-abort-update-check',
  getPythonVersion: 'ptoolkit-get-python-version',
};

export const pythonStorageChannels = {
  getAvailableConda: 'psc:getAvailableConda',
  setAvailableConda: 'psc:setAvailableConda',

  getAvailableOfficial: 'psc:getAvailableOfficial',
  setAvailableOfficial: 'psc:setAvailableOfficial',

  getCachedUsage: 'psc:getCachedUsage',
  setCachedUsage: 'psc:setCachedUsage',
  clearCachedUsage: 'psc:clearCachedUsage',

  getVenvCustomTitle: 'psc:getVenvCustomTitle',
  setVenvCustomTitle: 'psc:setVenvCustomTitle',
};

export type PkgDisplayType = 'capitalize' | 'startCase' | 'default' | string;

export type CachedUsage = {id: string; usage: number};
export type CustomTitle = {title: string; path: string};

export type PythonVenvSelectItem = {label: string; dir: string; type: 'python' | 'venv' | 'conda'; condaName?: string};
export type AssociateItem = {id: string; dir: string; type: 'python' | 'venv' | 'conda'; condaName?: string};
export type AssociateAction = 'add' | 'remove' | 'init';
export type ParsedPythonVersion = {major: number; minor: number; patch: number};
