export const ModulesSupportPython = [
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

export const Python_AvailableModules = {
  a1: 'Automatic1111_SD',
  sdAmd: 'LSHQQYTIGER_SD',
  sdForgeAmd: 'LSHQQYTIGER_Forge_SD',
  sdForge: 'Lllyasviel_SD',
  comfyui: 'ComfyUI_SD',
  comfyuiZluda: 'ComfyUI_Zluda_ID',
  sdNext: 'VLADMANDIC_SD',
  swarm: 'McMonkeyProjects_SD',
  kohya: 'Bmaltais_SD',
  onetrainer: 'Nerogar_SD',
  sdUiux: 'Anapnoe_SD',
  invoke: 'InvokeAI_SD',
  alltalk: 'Erew123_SD',
  tg: 'Oobabooga_TG',
  sillyTavern: 'SillyTavern_TG',
  openWebui: 'OpenWebUI_TG',
  boltDiy: 'BoltDiy_TG',
  flowiseAi: 'FlowiseAI_TG',
  lollms: 'LoLLMS_TG',
  tts: 'Rsxdalv_AG',
  ag: 'Gitmylo_AG',
};

/** @deprecated use Associates_StorageID instead */
export const AI_VENV_STORE_KEYS = 'ai_venvs';

// main storage id's
export const MaxRetry_StorageID = 'pythonToolkit_MaxRetry';
export const PkgDisplay_StorageID = 'pythonToolkit_MpkgDisplay';
export const DefaultLynxPython_StorageID = 'pythonToolkit_DefaultLynxPython';
export const CacheDirUsage_StorageID = 'pythonToolkit_CacheDirUsage';
export const CardStartCommand_StorageID = 'pythonToolkit_CardStartCommands';
export const Associates_StorageID = 'pythonToolkit_associates';

// Renderer storage id's
export const FolderDiskUsage_StorageID = 'pythonToolkit_FolderDiskUsage';

// Utils
export const getDiskUsageID = (path: string) => `${FolderDiskUsage_StorageID}_${path}`;
