export const PYTHON_SUPPORTED_AI = [
  'LSHQQYTIGER_SD',
  'LSHQQYTIGER_Forge_SD',
  'Automatic1111_SD',
  'ComfyUI_SD',
  'ComfyUI_Zluda_ID',
  'VLADMANDIC_SD',
  'Lllyasviel_SD',
  'Nerogar_SD',
  'Anapnoe_SD',
  'Erew123_SD',
  'Oobabooga_TG',
  'Gitmylo_AG',
  'OpenWebUI_TG',
];

// main storage id's
export const MaxRetry_StorageID = 'pythonToolkit_MaxRetry';
export const PkgDisplay_StorageID = 'pythonToolkit_MpkgDisplay';
export const DefaultLynxPython_StorageID = 'pythonToolkit_DefaultLynxPython';
export const CacheDirUsage_StorageID = 'pythonToolkit_DefaultLynxPython';

// Renderer storage id's
export const FolderDiskUsage_StorageID = 'pythonToolkit_FolderDiskUsage';

export const getDiskUsageID = (path: string) => `${FolderDiskUsage_StorageID}_${path}`;
