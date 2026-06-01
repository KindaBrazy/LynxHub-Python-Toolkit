import XTermCore from '@lynx/components/XTermCore';

export default function TerminalView() {
  return <XTermCore minResizeCols={0} minResizeRows={0} id="python-update" className="overflow-hidden" />;
}
