import XTermCore, {XTermAPI} from '@lynx/components/XTermCore';

export default function TerminalView() {
  const onReady = (api: XTermAPI) => {
    const terminalElement = api.terminal.element;

    if (terminalElement) {
      terminalElement.classList.add('size-full', 'overflow-hidden');

      const xViewport = terminalElement.querySelector('.xterm-viewport');
      if (xViewport) {
        xViewport.classList.add('bottom-3!');
      }
    }

    api.fitAddon.fit();
  };

  return <XTermCore type="terminal" onReady={onReady} id="python-update" className="overflow-hidden" />;
}
