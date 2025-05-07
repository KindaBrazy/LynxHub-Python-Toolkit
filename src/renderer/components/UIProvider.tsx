import {ConfigProvider, theme} from 'antd';
import {ReactNode, useMemo} from 'react';

import {useAppState} from '../../../../src/renderer/src/App/Redux/Reducer/AppReducer';

export default function UIProvider({children}: {children: ReactNode}) {
  const darkMode = useAppState('darkMode');

  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm,
        components: {
          Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
          Tooltip: {colorBgSpotlight, colorTextLightSolid},
        },
        token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
      }}>
      {children}
    </ConfigProvider>
  );
}
