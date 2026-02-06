/**
 * Internal PTY IPC implementation for the extension
 * Provides minimal IPC functionality needed for package updates
 */

import {getAppManager} from '../DataHolder';

const PTY_CHANNELS = {
  onData: 'pty-on-data',
  onExit: 'pty-on-exit-code',
};

export const ptyIpc = {
  send: {
    onData: (id: string, data: string) => {
      const appManager = getAppManager();
      appManager?.sendMessage(PTY_CHANNELS.onData, id, data);
    },
    onExit: (id: string) => {
      const appManager = getAppManager();
      appManager?.sendMessage(PTY_CHANNELS.onExit, id);
    },
  },
};
