export type PythonInstallation = {
  version: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  installationType: 'official' | 'conda' | 'pyenv' | 'other';
  architecture: '32bit' | '64bit';
  buildArchitecture: '32bit' | '64bit';
  installPath: string;
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
