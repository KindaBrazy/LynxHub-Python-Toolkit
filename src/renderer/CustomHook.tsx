import {Code} from '@heroui/react';
import {notification} from 'antd';
import {isString} from 'lodash';
import {Fragment, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import pIpc from './PIpc';
import {PythonToolkitActions} from './reducer';

export default function CustomHook() {
  const dispatch = useDispatch();

  useEffect(() => {
    pIpc.getCacheStorageUsage().then(result => {
      dispatch(PythonToolkitActions.setCacheStorageUsage(result));
    });
    pIpc.getPkgDisplay().then(result => {
      dispatch(PythonToolkitActions.setPkgDisplay(result));
    });

    pIpc.onErrorGetVenvInfo((_, e) => {
      const message = e.message;
      if (message && isString(message)) {
        if (message.toLowerCase().includes('no python at')) {
          notification.error({
            message: 'Python Not Found',
            description: (
              <div>
                <span className="!text-md whitespace-pre-line">
                  {`Required Python version is missing. Please install it, so LynxHub can validate` +
                    ` your environment.\nDetails:\n`}
                </span>
                <Code
                  color="warning"
                  className="whitespace-pre-line text-nowrap font-JetBrainsMono w-full overflow-auto">
                  {message.replace("Error invoking remote method 'get-venvs': Error:", '')}
                </Code>
              </div>
            ),
            className: '!w-fit !max-w-[777px]',
            duration: 0,
          });
        }
      }
    });

    return () => {
      pIpc.offErrorGetVenvInfo();
    };
  }, []);

  return <Fragment />;
}
