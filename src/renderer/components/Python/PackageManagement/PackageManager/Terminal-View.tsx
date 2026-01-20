import applicationIpc from '@lynx_shared/ipc/application';
import ptyIpc from '@lynx_shared/ipc/pty';
import {CanvasAddon} from '@xterm/addon-canvas';
import {ClipboardAddon} from '@xterm/addon-clipboard';
import {FitAddon} from '@xterm/addon-fit';
import {WebLinksAddon} from '@xterm/addon-web-links';
import {WebglAddon} from '@xterm/addon-webgl';
import {ITheme, IWindowsPty, Terminal} from '@xterm/xterm';
import FontFaceObserver from 'fontfaceobserver';
import {useCallback, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../src/renderer/main_window/hooks/utils';
// eslint-disable-next-line
import parseTerminalColors from '../../../../../../../src/renderer/main_window/layouts/browser_terminal/terminal/colorHandler';
import {useAppState} from '../../../../../../../src/renderer/main_window/redux/reducers/app';
import {useTerminalState} from '../../../../../../../src/renderer/main_window/redux/reducers/terminal';
import {isWebgl2Supported} from '../../../../../../../src/renderer/main_window/utils';
import {getColor} from '../../../../../../../src/renderer/main_window/utils/constants';

const id = 'python-update';

const FONT_FAMILY = 'JetBrainsMono';
const FONT_SIZE = 14;

export default function TerminalView() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const darkMode = useAppState('darkMode');
  const dispatch = useDispatch();

  const outputColor = useTerminalState('outputColor');

  const getTheme = useCallback(
    (): ITheme => ({
      background: darkMode ? '#18181B' : '#ffffff',
      foreground: darkMode ? getColor('white') : getColor('black'),
      cursor: darkMode ? getColor('white') : getColor('black'),
      cursorAccent: darkMode ? getColor('white') : getColor('black'),
      selectionForeground: darkMode ? getColor('black') : getColor('white'),
      selectionBackground: darkMode ? getColor('white', 0.7) : getColor('black', 0.7),
    }),
    [darkMode],
  );

  const setTheme = useCallback(() => {
    if (terminal.current) {
      terminal.current.options.theme = getTheme();
    }
  }, [getTheme, terminal.current]);

  useEffect(() => {
    setTheme();
  }, [darkMode]);

  const writeData = useCallback(
    (data: string) => {
      terminal.current?.write(outputColor ? parseTerminalColors(data) : data);
    },
    [terminal.current, outputColor],
  );

  useEffect(() => {
    async function loadTerminal() {
      const JetBrainsMono = new FontFaceObserver(FONT_FAMILY);

      const sysInfo = await applicationIpc.invoke.getSystemInfo();
      // Windows requires PTY backend config (conpty for Win10 1809+, winpty for older)
      // macOS/Linux use native PTY and don't need this configuration
      const windowsPty: IWindowsPty | undefined =
        sysInfo.os === 'win32'
          ? {
              backend: (sysInfo.buildNumber as number) >= 18309 ? 'conpty' : 'winpty',
              buildNumber: sysInfo.buildNumber as number,
            }
          : undefined;

      const initTerminal = (fontFamily: string | undefined) => {
        let renderMode: 'webgl' | 'canvas' = isWebgl2Supported() ? 'webgl' : 'canvas';

        // Create and initialize the terminal object with a default background and cursor
        terminal.current = new Terminal({
          allowProposedApi: true,
          rows: 150,
          cols: 150,
          scrollback: 10000,
          cursorBlink: true,
          fontFamily,
          fontSize: FONT_SIZE,
          scrollOnUserInput: true,
          cursorStyle: 'bar',
          cursorInactiveStyle: 'none',
          windowsPty,
        });

        setTheme();

        fitAddon.current = new FitAddon();

        terminal.current.loadAddon(fitAddon.current);

        terminal.current.loadAddon(new ClipboardAddon());

        terminal.current.loadAddon(
          new WebLinksAddon((_event, uri) => {
            window.open(uri);
          }),
        );

        if (terminalRef.current) terminal.current.open(terminalRef.current);

        if (renderMode === 'webgl') {
          const webglAddon: WebglAddon = new WebglAddon();

          webglAddon.onContextLoss(() => {
            webglAddon.dispose();
            terminal.current?.loadAddon(new CanvasAddon());
            renderMode = 'canvas';
          });

          terminal.current.loadAddon(webglAddon);

          renderMode = 'webgl';
        } else {
          terminal.current.loadAddon(new CanvasAddon());
          renderMode = 'canvas';
        }

        fitAddon.current.fit();
      };

      JetBrainsMono.load()
        .then(() => {
          initTerminal('JetBrainsMono');
        })
        .catch(() => {
          lynxTopToast(dispatch).warning('Failed to load terminal font!');
          initTerminal(undefined);
        });
    }

    if (terminalRef.current && !terminal.current) {
      loadTerminal();
    }

    const offData = ptyIpc.onData((dataID, data) => {
      if (dataID === id) writeData(data);
    });

    return () => offData();
  }, [terminalRef]);

  return <div ref={terminalRef} className="my-2 overflow-hidden" />;
}
