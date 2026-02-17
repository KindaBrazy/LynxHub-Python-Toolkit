import XTermCore from '@lynx/components/XTermCore';
import {useMemo} from 'react';

export default function TerminalView() {
  const id = useMemo(() => 'python-update', []);

  return <XTermCore id={id} minResizeCols={0} minResizeRows={0} className="overflow-hidden" />;
}
